import {type Context, createContext, useContext, useEffect, useId, useMemo, useState} from "react";


export interface GroupOp<T, Key = string> {
    update(key: Key, data: T): void

    delete(key: Key): void
}


export function createGroupOpContext<T, Key = string>(): Context<GroupOp<T, Key>> {
    return createContext<GroupOp<T, Key>>({
        update: () => {
        },
        delete: () => {
        }
    });
}

export function useGroupData<T, Key extends string | number | symbol = string>(
    initValue: Record<Key, T>,
    defaultChild: T,
): {
    data: Record<Key, T>,
    context: GroupOp<T, Key>
} {
    const [data, setData] = useState<Record<Key, T>>(initValue);
    const context = useMemo<GroupOp<T, Key>>(() => {
        return {
            update(id: Key, data: T) {
                setData(prev => {
                    if (prev[id] === data) {
                        return prev;
                    }
                    return ({...prev, [id]: data});
                });
            },
            delete(id: Key) {
                setData(prev => {
                    if (!prev.hasOwnProperty(id)) {
                        return prev;
                    } else {
                        return ({...prev, [id]: defaultChild});
                    }
                });
            }
        }
    }, [setData, defaultChild])

    useEffect(() => {
        setData(prev => {
            // check if all keys are in prev
            if (Object.entries(initValue).every(([id]) => prev.hasOwnProperty(id))) {
                // If all sets, return prev
                return prev;
            }
            // Set default for init value
            return {...initValue, ...prev};
        });
    }, [initValue]);

    return {
        data,
        context,
    };
}

export function useChildUpdate<T, Key = string>(ctx: Context<GroupOp<T, Key>>, key: Key, value: T) {
    const context = useContext(ctx);
    useEffect(() => {
        context.update(key, value);
    }, [key, value]);
}


export function useChildUpdateAndDelete<T, Key = string>(ctx: Context<GroupOp<T, Key>>, key: Key, value: T) {
    const context = useContext(ctx);
    useEffect(() => {
        context.update(key, value);
        return () => {
            context.delete(key);
        };
    }, [key, value]);
}


export function useChildId<T>(ctx: Context<GroupOp<T>>, value: T) {
    const context = useContext(ctx);
    const id = useId();
    useEffect(() => {
        context.update(id, value);
        return () => {
            context.delete(id);
        };
    }, [id, value]);
}