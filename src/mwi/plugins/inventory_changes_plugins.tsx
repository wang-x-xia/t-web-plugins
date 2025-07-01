import * as React from "react";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {jsonCopy} from "../../shared/utils";
import {ShowTimestamp} from "../component/date";
import {BuyItemTable, SellItemTable} from "../component/item-table";
import {ShowStoreActions} from "../component/store";
import {getActionName} from "../engine/action";

import {AllLoadedEvent} from "../engine/engine-event";
import {InventoryItemChanges$, type ItemChangesData, mergeItemChangesData} from "../engine/inventory";
import {type StoreDefine, storeSubject} from "../engine/store";
import {AddView} from "../view";


export function inventoryChangesPlugin() {
    AllLoadedEvent.subscribe({
        complete: () => {
            AddView({
                id: "inventory-changes",
                name: "Inventory Changes",
                node: <>
                    <ShowStoreActions store={ItemChangesStore}/>
                    <ShowInventoryChanges/>
                </>,
            });
        },
    });
}

interface HourChangesData {
    time: number
    action: Record<string, ItemChangesData>
    market: ItemChangesData
    quest: ItemChangesData
    unknown: ItemChangesData
}

const ItemChangesStore: StoreDefine<HourChangesData[]> = {
    id: "item-changes",
    name: "Item Changes",
    enableSettings: true,
    characterBased: true,
    defaultValue: [],
}

const InventoryChangesData$ = storeSubject(ItemChangesStore);
InventoryItemChanges$.subscribe(({added, removed, cause, time}) => {
    const hour = Math.floor(time / 1000 / 60 / 60) * 1000 * 60 * 60;
    let result = jsonCopy(InventoryChangesData$.getValue());
    let entry = result.find(it => it.time === hour);
    if (!entry) {
        entry = {
            time: hour,
            action: {},
            market: {added: [], removed: []},
            quest: {added: [], removed: []},
            unknown: {added: [], removed: []},
        };
        result = [...result, entry];
    }
    if (cause.type === "action") {
        entry.action[cause.action] = mergeItemChangesData(entry.action[cause.action] ?? {
            added: [],
            removed: []
        }, {added, removed});
    } else if (cause.type === "market") {
        entry.market = mergeItemChangesData(entry.market, {added, removed})
    } else if (cause.type === "quest") {
        entry.quest = mergeItemChangesData(entry.quest, {added, removed})
    } else {
        entry.unknown = mergeItemChangesData(entry.unknown, {added, removed})
    }
    // Reverse order
    result.sort((a, b) => b.time - a.time);
    InventoryChangesData$.next(result);
});

function ShowInventoryChanges() {
    const changes = useLatestOrDefault(InventoryChangesData$, []);

    return <table>
        <thead>
        <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Other</th>
        </tr>
        </thead>
        <tbody>
        {changes.map((it) => <tr key={it.time}>
            <td><ShowTimestamp value={it.time}/></td>
            <td>
                <table>
                    <thead>
                    <tr>
                        <th>Action</th>
                        <th>Added</th>
                        <th>Removed</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(it.action).map(([action, changes]) => <tr key={action}>
                        <td>{getActionName(action)}</td>
                        <td>
                            <BuyItemTable items={changes.added}/>
                        </td>
                        <td>
                            <SellItemTable items={changes.removed}/>
                        </td>
                    </tr>)}
                    </tbody>
                </table>
            </td>
            <td>
                <table>
                    <thead>
                    <tr>
                        <th>Type</th>
                        <th>Added</th>
                        <th>Removed</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        (it.market.added.length > 0 || it.market.removed.length > 0) ?
                            <tr>
                                <td>Market</td>
                                <td>
                                    <BuyItemTable items={it.market.added}/>
                                </td>
                                <td>
                                    <SellItemTable items={it.market.removed}/>
                                </td>
                            </tr> : <></>
                    }
                    {
                        (it.quest && (it.quest.added.length > 0 || it.quest.removed.length > 0)) ?
                            <tr>
                                <td>Quest</td>
                                <td>
                                    <BuyItemTable items={it.quest.added}/>
                                </td>
                                <td>
                                    <SellItemTable items={it.quest.removed}/>
                                </td>
                            </tr> : <></>
                    }
                    {
                        (it.unknown && (it.unknown.added.length > 0 || it.unknown.removed.length > 0)) ?
                            <tr>
                                <td>Unknown</td>
                                <td>
                                    <BuyItemTable items={it.unknown.added}/>
                                </td>
                                <td>
                                    <SellItemTable items={it.unknown.removed}/>
                                </td>
                            </tr> : <></>
                    }
                    </tbody>
                </table>
            </td>
        </tr>)}
        </tbody>
    </table>
}