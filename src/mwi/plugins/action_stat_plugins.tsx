import * as React from "react";
import {uniqueStrings} from "../../shared/list";
import {registerHandler} from "../../shared/mq";
import {useRecentEvents} from "../../shared/mq-react";
import {ShowNumber, ShowPercent} from "../component/number";
import {getActionName} from "../engine/action";
import {getItemName} from "../engine/item";
import {ActionCompleteEvent, type ActionCompleteEventData, CharacterLoadedEvent} from "../lifecycle";
import {AddView} from "../view";


export function actionStatPlugin() {
    registerHandler("action-stat-init", [CharacterLoadedEvent], () => {
        AddView({
            id: "action-stat",
            name: "Action Stat",
            node: <ShowActionStat/>,
        });
    });
}

function ShowActionStat() {
    const events = useRecentEvents(ActionCompleteEvent)

    if (events.length === 0) {
        return <>No Action</>;
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
            <th>ItemChanges</th>
        </tr>
        </thead>
        <tbody>
        {Object.entries(groupedAction).map(([hrid, events]) => <tr key={hrid}>
            <th>{getActionName(hrid)}</th>
            <ShowEventStats events={events}/>
        </tr>)}
        </tbody>
    </table>
}


export function ShowEventStats({
                                   events
                               }: {
    events: ActionCompleteEventData[]
}) {
    const items = uniqueStrings(events.flatMap(it => [...it.added, ...it.removed].map(it => it.itemHrid)))
    return <>
        <td>
            <table>
                <thead>
                <tr>
                    <th>Item</th>
                    <th>Stats</th>
                </tr>
                </thead>
                <tbody>
                {items.map(hrid =>
                    <tr key={hrid}>
                        <th>{getItemName(hrid)}</th>
                        <td>
                            <ShowItemStat itemHrid={hrid} events={events}/>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </td>
    </>
}

function ShowItemStat({itemHrid, events}: { itemHrid: string, events: ActionCompleteEventData[] }) {
    const dist: Record<number, number> = {}
    events.forEach(evnet => [...evnet.added, ...evnet.removed].forEach(item => {
        if (item.itemHrid === itemHrid) {
            dist[item.count] = (dist[item.count] ?? 0) + 1;
        }
    }));
    const counts = Object.keys(dist).map(k => Number(k)).sort((a, b) => a - b);
    const rows: {
        count: number,
        times: number,
        percent: number,
        percentOfAll: number,
        subtotal: number,
        subtotalPercent: number,
    }[] = counts.map(count => ({
        count,
        times: dist[count],
        percent: 0,
        percentOfAll: dist[count] / events.length,
        subtotal: count * dist[count],
        subtotalPercent: 0,
    }));

    const times = rows.reduce((acc, row) => acc + row.times, 0);
    const total = rows.reduce((acc, row) => acc + row.subtotal, 0);
    rows.forEach(row => row.percent = row.times / times);
    rows.forEach(row => row.subtotalPercent = row.subtotal / total);


    return <table>
        <thead>
        <tr>
            <th>Count</th>
            <th>Times</th>
            <th>%</th>
            <th>%OfAll</th>
            <th>Subtotal</th>
            <th>%</th>
        </tr>
        </thead>
        <tbody>
        {rows.map(row => <tr key={row.count}>
            <td><ShowNumber value={row.count}/></td>
            <td><ShowNumber value={row.times}/></td>
            <td><ShowPercent value={row.percent}/></td>
            <td><ShowPercent value={row.percentOfAll}/></td>
            <td><ShowNumber value={row.subtotal}/></td>
            <td><ShowPercent value={row.subtotalPercent}/></td>
        </tr>)}
        </tbody>
        <tfoot>
        <tr>
            <th>Avg</th>
            <th></th>
            <th><ShowNumber value={total / times}/></th>
            <th><ShowNumber value={total / events.length}/></th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <th>Total</th>
            <th><ShowNumber value={times}/></th>
            <th>(<ShowNumber value={events.length}/>)</th>
            <th><ShowPercent value={times / events.length}/></th>
            <th><ShowNumber value={total}/></th>
            <th></th>
        </tr>
        </tfoot>
    </table>
}