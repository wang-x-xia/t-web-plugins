import * as React from "react";
import {uniqueStrings} from "../../shared/list";
import {useLatestValue} from "../../shared/rxjs-react";
import {ShowNumber, ShowPercent} from "../component/number";
import {getActionName} from "../engine/action";

import {ActionCompleteEvent, type ActionCompleteEventData, AllLoadedEvent} from "../engine/engine-event";
import {getItemName} from "../engine/item";
import {createCharacterStore, StoreMode} from "../engine/store";
import {loadSettings, saveSettings, useSettings} from "../settings";
import {AddView} from "../view";


const store = createCharacterStore<ActionCompleteEventData[]>("action-stat.events", StoreMode.Local);

export function actionStatPlugin() {
    migration();
    setupEventsStore();
    AllLoadedEvent.subscribe({
        complete: () => {
            AddView({
                id: "action-stat",
                name: "Action Stat",
                node: <>
                    <ShowStoreInfo/>
                    <ShowActionStat/>
                </>,
            });
        },
    });
}

function migration() {
    // Clear previous stored data
    const legacy = JSON.parse(GM_getValue("action-stat.store", "[]"))
    if (legacy) {
        store.data = legacy
        GM_setValue("action-stat.store", "[]");
    }
}


function setupEventsStore() {
    ActionCompleteEvent.subscribe((event) => {
        if (!loadSettings("action-stat.store.enable", false)) {
            return;
        }
        if (event.count === 0) {
            return;
        }
        store.data = [...store.data, event];
    });
}


function ShowStoreInfo() {
    const events = useLatestValue(store.data$) ?? [];

    const enable = useSettings("action-stat.store.enable", false);
    return <div>
        Action Stat store
        <input type="checkbox" checked={enable} onChange={(e) => saveSettings("action-stat.store.enable",
            e.target.checked)}/>
        Records: <ShowNumber value={events.length}/>
        <button onClick={() => store.data = []}>Clear</button>
        <button onClick={() => exportStore()}>Save as</button>
    </div>
}

function exportStore() {
    const blob = new Blob([JSON.stringify(store.data)], {type: "application/json;charset=utf-8"});
    window.open(window.URL.createObjectURL(blob));
}

function ShowActionStat() {
    const events = useLatestValue(store.data$) ?? [];

    if (events.length === 0) {
        return <>
            No Action
        </>;
    }

    const groupedAction = events.reduce((map, event) => {
        const action = getActionName(event.hrid);
        if (action in map) {
            map[action].push(event);
        } else {
            map[action] = [event];
        }
        return map;
    }, {} as Record<string, ActionCompleteEventData[]>)

    return <table>
        <thead>
        <tr>
            <th>Action</th>
            <th>Efficiency</th>
            <th>Item Changes</th>
        </tr>
        </thead>
        <tbody>
        {Object.entries(groupedAction).map(([hrid, events]) => <tr key={hrid}>
            <th>{getActionName(hrid)}</th>
            <ShowEfficiencyStat events={events}/>
            <ShowEventStats events={events}/>
        </tr>)}
        </tbody>
    </table>
}

export function ShowEfficiencyStat({events}: { events: ActionCompleteEventData[] }) {
    const rows: { count: number, times: number, timesPercent: number, action: number, actionPercent: number }[] = []
    events.forEach(it => {
        let row = rows.find(row => row.count === it.count)
        if (!row) {
            row = {count: it.count, times: 0, timesPercent: 0, action: 0, actionPercent: 0}
            rows.push(row)
        }
        row.times++
        row.action += it.count
    })
    rows.sort((a, b) => a.count - b.count)
    const total = rows.reduce((sum, it) => sum + it.action, 0)
    rows.forEach(it => it.actionPercent = it.action / total)
    rows.forEach(it => it.timesPercent = it.times / events.length)
    return <td>
        <table>
            <thead>
            <tr>
                <th>Count</th>
                <th>Times</th>
                <th>%</th>
                <th>Actions</th>
                <th>%</th>
            </tr>
            </thead>
            <tbody>
            {rows.map(it => <tr key={it.count}>
                <th>{it.count}</th>
                <td><ShowNumber value={it.times}/></td>
                <td><ShowPercent value={it.timesPercent}/></td>
                <td><ShowNumber value={it.action}/></td>
                <td><ShowPercent value={it.actionPercent}/></td>
            </tr>)}
            </tbody>
            <tfoot>
            <tr>
                <th>Total</th>
                <th><ShowNumber value={events.length}/></th>
                <th></th>
                <th><ShowNumber value={total}/></th>
                <th></th>
            </tr>
            <tr>
                <th colSpan={3}>Efficiency</th>
                <th><ShowNumber value={total / events.length}/></th>
                <th></th>
            </tr>
            </tfoot>
        </table>
    </td>
}

export function ShowEventStats({events}: { events: ActionCompleteEventData[] }) {
    const items = uniqueStrings(events.flatMap(it => [...it.added, ...it.removed].map(it => it.itemHrid)))
    return <td>
        <table>
            <thead>
            <tr>
                {items.map(hrid =>
                    <th key={hrid}>{getItemName(hrid)}</th>)}
            </tr>
            </thead>
            <tbody>
            <tr>
                {items.map(hrid =>
                    <td key={hrid}>
                        <ShowItemStat itemHrid={hrid} events={events}/>
                    </td>
                )}
            </tr>
            </tbody>
        </table>
    </td>
}

function ShowItemStat({itemHrid, events}: { itemHrid: string, events: ActionCompleteEventData[] }) {
    const rows: {
        action: number,
        itemCount: number,
        times: number,
        timesPercent: number,
        subtotal: number,
    }[] = []
    const subtotalActions: Record<number, number> = {};
    events.forEach(event => {
        const itemCount = [...event.added, ...event.removed].find(item => item.itemHrid === itemHrid)?.count ?? 0;
        let row = rows.find(row => row.action === event.count && row.itemCount === itemCount)
        if (!row) {
            row = {
                action: event.count,
                itemCount: itemCount,
                times: 0,
                timesPercent: 0,
                subtotal: 0,
            };
            rows.push(row);
        }
        row.times += 1;
        subtotalActions[row.action] = (subtotalActions[row.action] ?? 0) + 1;
    });
    rows.forEach(row => row.timesPercent = row.times / subtotalActions[row.action]);

    const totalActions = events.reduce((acc, event) => acc + event.count, 0);

    rows.forEach(row => row.subtotal = row.times * row.itemCount);
    const total = rows.reduce((acc, row) => acc + row.subtotal, 0);

    rows.sort((a, b) => a.action - b.action || a.itemCount - b.itemCount);
    return <table>
        <thead>
        <tr>
            <th>Count</th>
            <th>Times</th>
            <th>%</th>
            <th>Subtotal</th>
        </tr>
        </thead>
        <tbody>
        {rows.map(row => <tr key={`${row.action}-${row.itemCount}`}>
            <td><ShowNumber value={row.itemCount}/> {"/"} <ShowNumber value={row.action}/></td>
            <td><ShowNumber value={row.times}/></td>
            <td><ShowPercent value={row.timesPercent}/></td>
            <td><ShowNumber value={row.subtotal}/></td>
        </tr>)}
        </tbody>
        <tfoot>
        <tr>
            <th>Avg</th>
            <th><ShowNumber value={total / totalActions}/></th>
            <th>Total</th>
            <th><ShowNumber value={total}/></th>
        </tr>
        </tfoot>
    </table>
}
