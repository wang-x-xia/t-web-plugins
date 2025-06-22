import * as React from "react";
import {Fragment, type ReactNode} from "react";
import {log} from "../../shared/log";
import {ShowItem} from "../component/item";
import {type ItemRow, ItemTable, prepareSellItems} from "../component/item-table";
import {ShowNumber, ShowPercent} from "../component/number";
import {type CollectAction, CollectActionType} from "../engine/action";
import {
    buffStore,
    getBuffTypeName,
    getEfficiencyAfterBuff,
    getGatheringAfterBuff,
    getRareFindAfterBuff,
    getSumOfBuff,
    getTimeCostAfterBuff
} from "../engine/buff";
import {type Buff, BuffSource, CollectBuffType, type EquipmentBuff} from "../engine/buff-type";
import {getBuffSourceName, getCollectActions} from "../engine/client";
import {DropType} from "../engine/drop";
import {AllLoadedEvent} from "../engine/engine-event";
import {useStoreData} from "../engine/store";
import {AddView} from "../view";

export function foragingPlugin() {
    AllLoadedEvent.subscribe({
        complete: () => {
            AddView({
                id: "foraging",
                name: "Foraging",
                node: <ShowForaging/>
            });
        },
    });
}

export interface ActionRow {
    action: CollectAction
    totalIncome: number
    dropItemRows: ItemRow[]
}


export function ShowForaging() {
    const [expandDropTable, setExpandDropTable] = React.useState(false);
    const buffsOrNull = useStoreData(buffStore());

    const buffs = (buffsOrNull ?? []).filter(b => b.action === CollectActionType.Foraging);
    const actionRows: ActionRow[] = getCollectActions(CollectActionType.Foraging)
        .map(action => {
            const inputs = action.dropTable.map((item) => {
                let count = item.dropRate
                    * (3600 / getTimeCostAfterBuff(action))
                    * (item.maxCount + item.minCount) / 2
                    * getEfficiencyAfterBuff(action);
                switch (item.type) {
                    case DropType.Common:
                        count = count * getGatheringAfterBuff(action);
                        break;
                    case DropType.Essence:
                        break;
                    case DropType.Rare:
                        count = count * getRareFindAfterBuff(action);
                        break;
                }
                return {
                    hrid: item.itemHrid,
                    count: count,
                }
            })
            const {total, items} = prepareSellItems(inputs)
            return {action, totalIncome: total, dropItemRows: items,}
        })
        .sort((a, b) => b.totalIncome - a.totalIncome);


    return <div>
        <ShowBuffTable buffs={buffs}/>
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Income/h</th>
                <th>Rate</th>
                <th>Drop Table
                    <button onClick={() => setExpandDropTable(!expandDropTable)}>
                        {expandDropTable ? "-" : "+"}
                    </button>
                </th>
            </tr>
            </thead>
            <tbody>
            {actionRows.map(({action, totalIncome, dropItemRows}) => <tr key={action.hrid}>
                <td>{action.name}</td>
                <td>{action.category.name}</td>
                <td><ShowNumber value={totalIncome}/></td>
                <td>
                    <div>
                        <ShowNumber value={action.baseTimeCost}/> s {"->"}
                        <ShowNumber value={getTimeCostAfterBuff(action)}/> s
                    </div>
                    <div><ShowNumber value={(3600 / getTimeCostAfterBuff(action))}/> times/h</div>
                    <div>Efficiency: <ShowNumber value={getEfficiencyAfterBuff(action)}/> ×</div>
                </td>
                <td><ShowDropTable rows={dropItemRows} expand={expandDropTable}/></td>
            </tr>)}
            </tbody>
        </table>
    </div>
}

export function ShowDropTable({rows, expand: allExpand}: { rows: ItemRow[], expand: boolean }) {
    const [expand, setExpand] = React.useState(allExpand);

    if (!expand && !allExpand) {
        return <button onClick={() => setExpand(true)}>+</button>
    }

    return <>
        {!allExpand && <button onClick={() => setExpand(!expand)}>-</button>}
        <ItemTable items={rows}/>
    </>
}

export interface BuffRow {
    key: string
    cells: ReactNode[]
}

export function ShowBuffTable({buffs}: { buffs: Buff[] }) {
    const buffRows: BuffRow[] = [];

    Object.values(CollectBuffType).forEach((buffType) => {
        const typeBuff = buffs.filter(b => b.type === buffType);
        const value = getSumOfBuff(buffs, buffType);

        if (typeBuff.length === 0) {
            buffRows.push({
                key: buffType as string,
                cells: [
                    <Fragment key="noBuff">
                        <th>{getBuffTypeName(buffType)}</th>
                        <td><ShowPercent value={value}/></td>
                        <td colSpan={4}></td>
                    </Fragment>
                ],
            });
            return;
        }
        const buffTypeStartRows = buffRows.length;
        typeBuff.forEach((buff) => {
            const buffStartRows = buffRows.length;
            if (buff.source === BuffSource.Equipment) {
                const equipmentBuff = buff as EquipmentBuff;
                equipmentBuff.equipments.forEach(equipment => {
                    buffRows.push({
                        key: equipment.itemHrid,
                        cells: [
                            <Fragment key="equipment">
                                <th>
                                    <ShowItem hrid={equipment.itemHrid} enhancementLevel={equipment.enhancementLevel}/>
                                </th>
                                <td>
                                    <ShowPercent value={equipment.value}/>
                                </td>
                            </Fragment>
                        ],
                    })
                })
            }
            const span = buffRows.length - buffStartRows;
            if (span > 0) {
                buffRows[buffStartRows].cells = [
                    <Fragment key="source">
                        <th rowSpan={span}>{getBuffSourceName(buff.source)}</th>
                        <th rowSpan={span}><ShowPercent value={buff.value}/></th>
                    </Fragment>,
                    ...buffRows[buffStartRows].cells,
                ];
            } else {
                buffRows.push({
                    key: buff.source as string,
                    cells: [
                        <Fragment key="source">
                            <th>{getBuffSourceName(buff.source)}</th>
                            <td><ShowPercent value={buff.value}/></td>
                            <td colSpan={2}></td>
                        </Fragment>
                    ],
                });
            }
        })
        const span = buffRows.length - buffTypeStartRows;
        buffRows[buffTypeStartRows].cells = [
            <Fragment key={buffType}>
                <th rowSpan={span}>{getBuffTypeName(buffType)}</th>
                <td rowSpan={span}><ShowPercent value={value}/></td>
            </Fragment>,
            ...buffRows[buffTypeStartRows].cells,
        ];
    })

    return <table>
        <thead>
        <tr>
            <th colSpan={2}>Buff Type</th>
            <th colSpan={2}>Source</th>
            <th colSpan={2}>Sub</th>
        </tr>
        </thead>
        <tbody>
        {buffRows.map((buffRow) =>
            <tr key={buffRow.key}>
                {...buffRow.cells}
            </tr>)}
        </tbody>
    </table>
}
