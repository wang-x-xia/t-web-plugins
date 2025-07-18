import {BehaviorSubject, combineLatest, map, Subject} from "rxjs";
import {jsonCopy} from "../../shared/utils";
import type {CharacterItem} from "../api/character-type";
import {OfflineChanges$} from "./action-queue";
import {type WithCharacterId} from "./character";
import {
    ActionCompleteData$,
    BuyMooPassWithCowbells$,
    ClaimAllMarketListings$,
    ClaimCharacterQuest$,
    ClaimMarketListing$,
    InitCharacterData$,
    ItemUpdatedData$,
    OpenLoot$,
    PostMarketOrder$
} from "./engine-event";
import {getItemCategory, ItemCategory} from "./item";


export interface InventoryData extends WithCharacterId {
    inventory: {
        [hrid: string]: {
            [enhancementLevel: number]: number
        };
    }
}

export const InventoryData$ = new BehaviorSubject<InventoryData | null>(null);
InitCharacterData$.pipe(
    map(data => {
        const localInventory = {} as Record<string, Record<number, number>>;
        data.characterItems.forEach((item) => {
            if (item.itemLocationHrid !== "/item_locations/inventory") {
                return;
            }
            localInventory[item.itemHrid] = localInventory[item.itemHrid] ?? {}
            localInventory[item.itemHrid][item.enhancementLevel] = item.count;
        });
        return {
            characterId: data.character.id,
            inventory: localInventory
        }
    }),
).subscribe(InventoryData$);


export interface ItemChange {
    hrid: string;
    count: number;
    level: number
}

/**
 * Due to the event order is not guaranteed, the cause of the change is unknown first for some scenarios
 */
export type ItemChangeCause = {
    "type": "action",
    "action": string,
} | {
    "type": "market",
} | {
    "type": "unknown",
} | {
    "type": "quest",
} | {
    "type": "loot",
} | {
    "type": "cowbell-store",
}

const ItemChangeCause$ = new BehaviorSubject<ItemChangeCause>({"type": "unknown"});
ActionCompleteData$.subscribe(({endCharacterAction}) => {
    // This is the changes for food and drink
    ItemChangeCause$.next({"type": "action", "action": endCharacterAction.actionHrid});
})
BuyMooPassWithCowbells$.subscribe(() => {
    ItemChangeCause$.next({"type": "cowbell-store"});
})
ClaimAllMarketListings$.subscribe(() => {
    ItemChangeCause$.next({"type": "market"});
})
ClaimMarketListing$.subscribe(() => {
    ItemChangeCause$.next({"type": "market"});
})
PostMarketOrder$.subscribe(() => {
    ItemChangeCause$.next({"type": "market"});
})
ClaimCharacterQuest$.subscribe(() => {
    ItemChangeCause$.next({"type": "quest"});
})
OpenLoot$.subscribe(() => {
    ItemChangeCause$.next({"type": "loot"});
})


export interface ItemChangesData {
    added: ItemChange[];
    removed: ItemChange[];
}

export function mergeItemChangesData(left: ItemChangesData | undefined, right: ItemChangesData): ItemChangesData {
    if (!left) {
        return right;
    }

    function mergeItemChangeData(left: ItemChange[], right: ItemChange[]): ItemChange[] {
        const total = jsonCopy(left)
        for (const item of right) {
            const index = total.findIndex(it => it.hrid === item.hrid);
            if (index >= 0) {
                total[index].count += item.count;
            } else {
                total.push(item);
            }
        }
        return total;
    }

    return {
        added: mergeItemChangeData(left.added, right.added),
        removed: mergeItemChangeData(left.removed, right.removed)
    }
}

export interface ItemChanges extends ItemChangesData {
    cause: ItemChangeCause;
    time: number
}

export const InventoryItemChanges$ = new Subject<ItemChanges>();

combineLatest({changes: OfflineChanges$, data: InitCharacterData$}).subscribe(({changes, data}) => {
    if (data.offlineItems.length === 0) {
        return;
    }
    InventoryItemChanges$.next({
        added: data.offlineItems
            .filter(it => it.itemLocationHrid === "/item_locations/inventory")
            .filter(it => it.offlineCount > 0)
            .map(it => ({
                hrid: it.itemHrid,
                count: it.offlineCount,
                level: it.enhancementLevel,
            })),
        removed: data.offlineItems
            .filter(it => it.itemLocationHrid === "/item_locations/inventory")
            .filter(it => it.offlineCount < 0)
            .map(it => ({
                hrid: it.itemHrid,
                count: it.offlineCount,
                level: it.enhancementLevel,
            })),
        cause: {"type": "action", "action": "Offline"},
        time: Date.now(),
    });
})

ItemUpdatedData$.subscribe(({endCharacterItems}) => {
    if (endCharacterItems === null) {
        return
    }
    let cause = ItemChangeCause$.getValue();
    if (cause.type === "action") {
        // Post checker of drink and food
        if (!endCharacterItems.every(it => [ItemCategory.Drink, ItemCategory.Food].includes(getItemCategory(it.itemHrid)))) {
            // Some items are not tea or food
            cause = {"type": "unknown"}
        }
    }
    updateInventory(endCharacterItems, cause);
    ItemChangeCause$.next({"type": "unknown"});
})


export function updateInventory(endCharacterItems: CharacterItem[], cause: ItemChangeCause): ItemChanges {
    const before = InventoryData$.getValue()!;
    const inventoryBefore = before.inventory
    const inventoryAfter = jsonCopy(inventoryBefore);
    const diffs = endCharacterItems
        .filter(item => item.itemLocationHrid === "/item_locations/inventory")
        .map<ItemChange>((item) => {
            inventoryAfter[item.itemHrid] = inventoryBefore[item.itemHrid] ?? {};
            const before = inventoryBefore[item.itemHrid]?.[item.enhancementLevel] ?? 0;
            const diff = item.count - before;
            inventoryAfter[item.itemHrid][item.enhancementLevel] = item.count;
            return {hrid: item.itemHrid, level: item.enhancementLevel, count: diff};
        });
    InventoryData$.next({...before, inventory: inventoryAfter});
    const result = {
        added: diffs.filter(diff => diff.count > 0),
        removed: diffs.filter(diff => diff.count < 0),
        cause,
        time: Date.now(),
    }
    InventoryItemChanges$.next(result);
    return result
}
