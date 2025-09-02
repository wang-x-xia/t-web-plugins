import * as React from "react";
import {ShowSettingValue} from "../../shared/settings";
import {AddView} from "../../shared/view";
import {ServerSetting} from "../common";

export function settingsPlugin() {
    AddView({id: "config", name: "Settings", node: <Settings/>})
}

function Settings() {
    return <>
        <label>Server:</label>
        <ShowSettingValue setting={ServerSetting}/>
    </>
}

