import {useEffect, useState} from "react";
import {log} from "../shared/log";
import {type EventDefine, publishEvent, registerAnonymousHandler, unregisterCallback} from "../shared/mq";


const SettingUpdate: EventDefine<{ setting: string, value: any }> = {
    type: "setting-update"
}

export function saveSettings(name: string, settings: any) {
    log("save-settings", {name, settings})
    GM_setValue(name, JSON.stringify(settings));
    publishEvent(SettingUpdate, {setting: name, value: settings});
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

export function registerSettingsUpdateHook(cb: SettingUpdateHook) {
    log("register-settings-update-hook", {cb})
    const id = registerAnonymousHandler([SettingUpdate], ({setting, value}) => {
        if (setting === cb.setting) {
            cb.callback(value);
        }
    })
    return () => {
        unregisterCallback(id);
    }
}

export function useSettings<T>(name: string, default_value: T): T {
    const [value, setValue] = useState(loadSettings(name, default_value));
    useEffect(() => registerSettingsUpdateHook({setting: name, callback: setValue}), [name]);
    return value;
}