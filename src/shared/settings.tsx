import * as React from "react";
import {useEffect, useState} from "react";
import {Subject} from "rxjs";
import {log, warn} from "./log";


export interface Setting<T> {
    id: string;
    name: string;
    defaultValue: T

    value: {
        type: "select",
        options: {
            id: string,
            name: string,
            value: T,
        }[],
    } | {
        type: "integer" | "float",
        min: number | null,
        max: number | null,
        step: number | null,
    } | {
        type: "bool",
    } | {
        type: "internal",
    }

}


const SettingUpdate = new Subject<{ setting: Setting<any>, value: any }>()

export function createSelectSetting<T>(
    id: string, name: string, defaultValue: T,
    options: { id: string, name: string, value: T }[]): Setting<T> {
    return {
        id, name, defaultValue,
        value: {
            type: "select",
            options,
        },
    }
}

export function createStringSelectSetting<T extends string>(
    {id, name, defaultValue}: { id: string, name: string, defaultValue: T, },
    options: { name: string, value: T }[]): Setting<T> {
    return {
        id, name, defaultValue,
        value: {
            type: "select",
            options: options.map(({name, value}) => ({id: value, name, value})),
        },
    }
}

export function createNumberSetting(
    {id, name, defaultValue}: { id: string, name: string, defaultValue: number, },
    mode: "float" | "integer",
    {min = null, max = null, step = null}: {
        min?: number | null,
        max?: number | null,
        step?: number | null
    } = {}): Setting<number> {
    return {
        id, name, defaultValue,
        value: {
            type: mode,
            min, max, step
        },
    };
}

export function createBoolSetting(id: string, name: string, defaultValue: boolean): Setting<boolean> {
    return {
        id, name, defaultValue,
        value: {
            type: "bool",
        },
    };
}

export function createInternalSetting<T>(id: string, name: string, defaultValue: T): Setting<T> {
    return {
        id, name, defaultValue,
        value: {
            type: "internal",
        },
    };
}

interface SettingStoredValue<T> {
    __version: number;
    time: number;
    value: T
}

export function updateSetting<T>(setting: Setting<T>, value: T) {
    log("update-setting", {setting, value});
    GM_setValue(setting.id, JSON.stringify(createValue(setting, value)));
    SettingUpdate.next({setting, value});
}

function createValue<T>(setting: Setting<T>, value: T): SettingStoredValue<T> {
    return {
        __version: 1,
        time: Date.now(),
        value,
    };
}

export function getSetting<T>(setting: Setting<T>): T {
    const data = getValue(setting);
    if (data === null) {
        return setting.defaultValue;
    } else if (checkSetting(setting, data.value)) {
        return data.value;
    } else {
        warn("invalid-setting", {setting, data});
        return setting.defaultValue;
    }
}

function getValue<T>(setting: Setting<T>): SettingStoredValue<T> | null {
    const raw = GM_getValue(setting.id, null);
    if (raw === null) {
        return null;
    }
    const data = JSON.parse(raw);
    if (data.hasOwnProperty("__version")) {
        return data;
    } else {
        return {
            __version: 0,
            time: 0,
            value: data,
        };
    }
}

export function checkSetting<T>(setting: Setting<T>, value: any): value is T {
    if (setting.value.type === "select") {
        return setting.value.options.some(option => option.value === value);
    }
    if (setting.value.type === "bool") {
        return (typeof value) === "boolean";
    }
    if (setting.value.type === "integer" || setting.value.type === "float") {
        if (typeof value !== "number") {
            return false;
        }
        if (setting.value.type === "integer" && !Number.isInteger(value)) {
            return false;
        }
        if (setting.value.min !== null && value < setting.value.min) {
            return false;
        }
        // noinspection RedundantIfStatementJS
        if (setting.value.max !== null && value > setting.value.max) {
            return false;
        }
        return true;
    }
    return true;
}

export function useSetting<T>(setting: Setting<T>): T {
    const [value, setValue] = useState(getSetting(setting));
    useEffect(() => {
        const subscription = SettingUpdate.subscribe({
            next: ({setting: updatedSetting, value}) => {
                if (setting.id === updatedSetting.id) {
                    setValue(value);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [setting.id]);
    return value;
}

export function ShowSettingValue({setting}: { setting: Setting<any> }) {
    const value = useSetting(setting);

    if (setting.value.type === "select") {
        return <select value={value} onChange={e => updateSetting(setting, e.target.value)}>
            {setting.value.options.map(option =>
                <option key={option.id} value={option.value}>{option.name}</option>)}
        </select>
    }
    if (setting.value.type === "bool") {
        return <input type="checkbox" checked={value} onChange={e => updateSetting(setting, e.target.checked)}/>
    }
    return <>{value}</>
}