import * as React from "react";
import type {LootLog} from "../api/loot-type";
import {ItemTable, prepareBuyItems, prepareSellItems} from "../component/item-table";
import {ShowNumber} from "../component/number";
import {getActionInputs, getActionName} from "../engine/action";
import {resolveItemHrid} from "../engine/hrid";
import {getLootLog} from "../engine/loot";
import {LifecycleEvent, registerLifecycle} from "../lifecycle";
import {AddView} from "../view";

export function lootTrackerPlugin() {
    registerLifecycle("character-loaded", [LifecycleEvent.LootLogUpdated], () => {
        AddView({
            id: "loot-tracker",
            name: "Loot Tracker",
            node: <ShowLootTracker/>
        });
    });
}

function ShowLootTracker() {
    const lootLogs = getLootLog().reverse();
    return <table>
        <thead>
        <tr>
            <th>Summary</th>
            <th>Inputs</th>
            <th>Spending</th>
            <th>Spending/h</th>
            <th>Drops</th>
            <th>Income</th>
            <th>Income/h</th>
        </tr>
        </thead>
        <tbody>
        {lootLogs.map((log) => <ShowLootLog key={log.startTime} log={log}/>)}
        </tbody>
    </table>;
}

function ShowLootLog({log}: { log: LootLog }) {
    const duration = (Date.parse(log.endTime) - Date.parse(log.startTime)) / 1000 / 60 / 60;
    const {total: income, items: drops} = prepareSellItems(Object.entries(log.drops)
        .map(([hridHash, count]) => ({...resolveItemHrid(hridHash), count})))

    const {total: spending, items: inputs} = prepareBuyItems(
        getActionInputs(log.actionHrid, log.primaryItemHash, log.secondaryItemHash)
            .map((item) => ({...item, count: item.count * log.actionCount,})));

    const date = new Date(Date.parse(log.startTime));

    return <tr>
        <td>
            <div><b>{getActionName(log.actionHrid)}</b></div>
            <div>{date.getFullYear()}-{date.getMonth() + 1}-{date.getDay()} {date.getHours()}:{date.getMinutes()}</div>
            <div><ShowNumber value={duration}/>h</div>
        </td>
        <td><ItemTable items={inputs}/></td>
        <td><ShowNumber value={spending}/></td>
        <td><ShowNumber value={spending / duration}/></td>
        <td><ItemTable items={drops}/></td>
        <td><ShowNumber value={income}/></td>
        <td><ShowNumber value={income / duration}/></td>
    </tr>
}