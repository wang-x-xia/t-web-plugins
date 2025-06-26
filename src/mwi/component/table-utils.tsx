import * as React from "react";
import {createContext, type ReactNode, useCallback, useContext, useEffect, useId, useMemo, useState} from "react";
import {sum} from "../../shared/list";
import {warn} from "../../shared/log";


interface RowsGroupContextData {
    groupCells: Record<string, ReactNode>

    /**
     *
     * @param id is the component id for debug
     * @param index is the row index of the group
     * @param rows is the sub rows in the group
     */
    register(id: string, index: number[], rows: number): void
}

const NoOpRowsGroupContextData: RowsGroupContextData = {
    groupCells: {},
    register() {
    },
}
const RowsGroupContext = createContext<RowsGroupContextData>(NoOpRowsGroupContextData);

function useGroupRows() {
    const [subRows, updateSubRows] = useState<Record<string, { id: string, rows: number, index: number[] }>>({})

    const register: RowsGroupContextData["register"] = useCallback((id, index, rows) => updateSubRows(prev => {
        const prevElement = prev[id];
        if (rows === 0) {
            if (prevElement === undefined) {
                // Skip update
                return prev;
            } else {
                const result = ({...prev});
                delete result[id];
                return result;
            }
        }
        if (prevElement === undefined) {
            return ({...prev, [id]: {id, rows, index}});
        }
        if (prevElement.rows === rows && prevElement.index.join(",") === index.join(",")) {
            // Skip update
            return prev;
        } else {
            return ({...prev, [id]: {id, rows, index}});
        }
    }), [updateSubRows]);

    const total = sum(Object.values(subRows).map(it => it.rows));

    const shownId = useMemo(() => {
        if (total === 0) {
            return "";
        }
        const result = Object.values(subRows).sort((a, b) => {
            for (let i = 0; i < a.index.length && i < b.index.length; i++) {
                if (a.index[i] !== b.index[i]) {
                    return a.index[i] - b.index[i];
                }
            }
            warn("not-comparable", {a, b, subRows});
            return a.index.length - b.index.length
        });
        return result[0].id
    }, [subRows, total]);

    return {
        total,
        shownId,
        register,
    }
}


/**
 * Use this to group rows.
 *
 * @param children is the content
 * @param groupCell is the group cell, the param is the number of rows
 * @param defaultRow is the default row if there is no row in the group
 */
export function RowsGroup(
    {children, groupCell, defaultRow}: {
        children: ReactNode,
        groupCell: (rows: number) => ReactNode,
        defaultRow: ReactNode
    }) {
    const parentContext = useContext(RowsGroupContext);
    const {total, shownId, register} = useGroupRows();

    const groupCellNodes = useMemo(() => groupCell(total), [total, groupCell]);

    const context: RowsGroupContextData = useMemo(() => {
        return ({
            groupCells: {
                ...parentContext.groupCells,
                [shownId]: <>{parentContext.groupCells[shownId]}{groupCellNodes}</>
            },
            groupCellShownId: shownId,
            register(id: string, index: number[], rows: number) {
                register(id, index, rows);
                parentContext.register(id, index, rows);
            },
        });
    }, [groupCellNodes, register, parentContext, shownId]);

    return <RowsGroupContext.Provider value={context}>
        {/*Only render the empty content if the group is shown*/}
        {total === 0 ? defaultRow : <></>}
        {children}
    </RowsGroupContext.Provider>
}

export function Rows({children, index}: { children: ReactNode, index: number }) {
    const context = useContext(RowsGroupContext);

    const newContext = useMemo(() => {
        return {
            ...context,
            register(id: string, subIndex: number[], num: number) {
                context.register(id, [index, ...subIndex], num);
            },
        }
    }, [index, context]);

    return <RowsGroupContext.Provider value={newContext}>
        {children}
    </RowsGroupContext.Provider>
}


export function WithGroupCell({children, index}: { children: ReactNode, index: number }) {
    const tableData = useContext(RowsGroupContext);
    const id = useId();

    useEffect(() => {
        tableData.register(id, [index], 1)
        return () => {
            tableData.register(id, [index], 0)
        }
    }, [tableData, index]);

    return <RowsGroupContext.Provider value={NoOpRowsGroupContextData}>
        {tableData.groupCells[id]}
        {children}
    </RowsGroupContext.Provider>
}
