import {useEffect, useState} from "react";
import {log} from "../shared/log";

export function saveSettings(name: string, settings: any) {
    GM_setValue(name, JSON.stringify(settings));
}

export function loadSettings<T>(name: string, default_value: T): T {
    const value = GM_getValue(name, null);
    if (value === null) {
        return default_value;
    }
    return JSON.parse(value);
}

interface SettingUpdateHook {
    setting: string;
    callback: (value: any) => void;
}

const updateHooks: SettingUpdateHook[] = [];

export function registerSettingsUpdateHook(cb: SettingUpdateHook) {
    log("register-settings-update-hook", {cb})
    updateHooks.push(cb);
    return () => {
        const index = updateHooks.indexOf(cb);
        if (index > -1) {
            log("unregister-settings-update-hook", {cb})
            updateHooks.splice(index, 1);
        }
    }
}

export function useSettings<T>(name: string, default_value: T): T {
    const [value, setValue] = useState(loadSettings(name, default_value));
    useEffect(() => registerSettingsUpdateHook({setting: name, callback: setValue}), [name]);
    return value;
}