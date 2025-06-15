import * as React from "react";
import {registerHandler} from "../../shared/mq";
import type {LootLog} from "../api/loot-type";
import {ItemTable, prepareBuyItems, prepareSellItems} from "../component/item-table";
import {ShowNumber} from "../component/number";
import {getActionInputs, getActionName} from "../engine/action";
import {resolveItemHrid} from "../engine/hrid";
import {getLootLog} from "../engine/loot";
import {LootLogUpdatedEvent} from "../lifecycle";
import {saveSettings, useSettings} from "../settings";
import {AddView} from "../view";

export function lootTrackerPlugin() {
    registerHandler("character-loaded", [LootLogUpdatedEvent], () => {
        AddView({
            id: "loot-tracker",
            name: "Loot Tracker",
            node: <ShowLootTracker/>
        });
    });
}

function ShowLootTracker() {
    const mode = useSettings<"all" | "hour">("loot-tracker.mode", "hour");

    const lootLogs = [...getLootLog()].reverse();
    return <>
        <div>
            Current: {mode === "hour" ? "Hourly Data" : "Total"}
            <button onClick={() => saveSettings("loot-tracker.mode", "hour")}>Hourly</button>
            <button onClick={() => saveSettings("loot-tracker.mode", "all")}>Total</button>
        </div>
        <table>
            <thead>
            <tr>
                <th>Summary</th>
                <th>Inputs</th>
                <th>Spending</th>
                <th>Drops</th>
                <th>Income</th>
            </tr>
            </thead>
            <tbody>
            {lootLogs.map((log) => <ShowLootLog key={log.startTime} log={log} mode={mode}/>)}
            </tbody>
        </table>
    </>
}

function ShowLootLog({log, mode}: { log: LootLog, mode: "all" | "hour" }) {
    const duration = (Date.parse(log.endTime) - Date.parse(log.startTime)) / 1000 / 60 / 60;
    const factor = mode === "hour" ? duration : 1;
    const {total: income, items: drops} = prepareSellItems(Object.entries(log.drops)
        .map(([hridHash, count]) => ({...resolveItemHrid(hridHash), count: count / factor})))

    const {total: spending, items: inputs} = prepareBuyItems(
        getActionInputs(log.actionHrid, log.primaryItemHash, log.secondaryItemHash)
            .map((item) => ({...item, count: item.count * log.actionCount / factor,})));

    const date = new Date(Date.parse(log.startTime));

    return <tr>
        <td>
            <div><b>{getActionName(log.actionHrid)}</b></div>
            <div>{date.getFullYear()}-{date.getMonth() + 1}-{date.getDate()} {date.getHours()}:{date.getMinutes()}</div>
            <div><ShowNumber value={duration}/>h</div>
        </td>
        <td><ItemTable items={inputs}/></td>
        <td><ShowNumber value={spending}/></td>
        <td><ItemTable items={drops}/></td>
        <td><ShowNumber value={income}/></td>
    </tr>
}