import {useEffect, useState} from "react";
import {Subject} from "rxjs";
import {log} from "../shared/log";


const SettingUpdate = new Subject<{ setting: string, value: any }>()

export function saveSettings(name: string, settings: any) {
    log("save-settings", {name, settings})
    GM_setValue(name, JSON.stringify(settings));
    SettingUpdate.next({setting: name, value: settings});
}

export function loadSettings<T>(name: string, default_value: T): T {
    const value = GM_getValue(name, null);
    if (value === null) {
        return default_value;
    }
    return JSON.parse(value);
}

export function useSettings<T>(name: string, default_value: T): T {
    const [value, setValue] = useState(loadSettings(name, default_value));
    useEffect(() => {
        const subscription = SettingUpdate.subscribe({
            next: ({setting, value}) => {
                if (setting === name) {
                    setValue(value);
                }
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [name]);
    return value;
}