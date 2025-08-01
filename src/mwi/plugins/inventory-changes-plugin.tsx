import * as React from "react";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {jsonCopy} from "../../shared/utils";
import {AddView} from "../../shared/view";
import {ShowTimestamp} from "../component/date";
import {BuyItemTable, SellItemTable} from "../component/item-table";
import {ShowStoreActions} from "../component/store";
import {getActionName} from "../engine/action";

import {AllLoadedEvent} from "../engine/engine-event";
import {InventoryItemChanges$, type ItemChangesData, mergeItemChangesData} from "../engine/inventory";
import {defineStore} from "../engine/store";


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
    loot: ItemChangesData
    other: ItemChangesData
    unknown: ItemChangesData
}

const ItemChangesStore = defineStore<HourChangesData[]>({
    id: "item-changes",
    name: "Item Changes",
    enableSettings: true,
    characterBased: true,
    defaultValue: [],
})

InventoryItemChanges$.subscribe(({added, removed, cause, time}) => {
    const hour = Math.floor(time / 1000 / 60 / 60) * 1000 * 60 * 60;
    let result = jsonCopy(ItemChangesStore.data$.getValue());
    let entry = result.find(it => it.time === hour);
    if (!entry) {
        entry = {
            time: hour,
            action: {},
            market: {added: [], removed: []},
            quest: {added: [], removed: []},
            loot: {added: [], removed: []},
            other: {added: [], removed: []},
            unknown: {added: [], removed: []},
        };
        result = [...result, entry];
    }
    if (cause.type === "action") {
        entry.action[cause.action] = mergeItemChangesData(entry.action[cause.action], {added, removed});
    } else if (cause.type === "market") {
        entry.market = mergeItemChangesData(entry.market, {added, removed})
    } else if (cause.type === "quest") {
        entry.quest = mergeItemChangesData(entry.quest, {added, removed})
    } else if (cause.type === "loot") {
        entry.loot = mergeItemChangesData(entry.loot, {added, removed})
    } else if (cause.type === "unknown") {
        entry.unknown = mergeItemChangesData(entry.unknown, {added, removed})
    } else {
        entry.other = mergeItemChangesData(entry.other, {added, removed})
    }
    // Reverse order
    result.sort((a, b) => b.time - a.time);
    ItemChangesStore.update(result);
});

function ShowInventoryChanges() {
    const changes = useLatestOrDefault(ItemChangesStore.data$, []);

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
            <td>
                <ShowTimestamp value={it.time}/>
                <button onClick={() => ItemChangesStore.update(prev => prev.filter(({time}) => time !== it.time))}>
                    x
                </button>
            </td>
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
                    <ShowChangeRow changes={it.market} name="Market"/>
                    <ShowChangeRow changes={it.quest} name="Quest"/>
                    <ShowChangeRow changes={it.loot} name="Loot"/>
                    <ShowChangeRow changes={it.other} name="Other"/>
                    <ShowChangeRow changes={it.unknown} name="Unknown"/>
                    </tbody>
                </table>
            </td>
        </tr>)}
        </tbody>
    </table>
}

function ShowChangeRow({changes, name}: { changes: ItemChangesData | undefined, name: string }) {
    if (changes && changes.added.length && changes.removed.length) {
        return <tr>
            <td>{name}</td>
            <td>
                <BuyItemTable items={changes.added.map(({hrid, level, count}) => ({
                    hrid, enhancementLevel: level, count,
                }))}/>
            </td>
            <td>
                <SellItemTable items={changes.removed.map(({hrid, level, count}) => ({
                    hrid, enhancementLevel: level, count,
                }))}/>
            </td>
        </tr>
    } else {
        return <></>
    }

}