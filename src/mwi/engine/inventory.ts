import type {CharacterItem} from "../api/character-type";
import type {ItemCount} from "../api/common-type";
import {InitCharacterSubject} from "./engine-event";
import {createCharacterStore} from "./store";


const store = createCharacterStore<Record<string, Record<number, number>>>("inventory");

InitCharacterSubject.subscribe(data => {
    const localInventory = {} as Record<string, Record<number, number>>;
    data.characterItems.forEach((item) => {
        if (item.itemLocationHrid !== "/item_locations/inventory") {
            return;
        }
        localInventory[item.itemHrid] = localInventory[item.itemHrid] ?? {}
        localInventory[item.itemHrid][item.enhancementLevel] = item.count;
    });
    store.data = localInventory;
});

export function updateInventory(data: CharacterItem[]): { added: ItemCount[], removed: ItemCount[] } {
    const inventory = store.data;
    const diffs = data
        .filter(item => item.itemLocationHrid === "/item_locations/inventory")
        .map((item) => {
            inventory[item.itemHrid] = inventory[item.itemHrid] ?? {};
            const before = inventory[item.itemHrid][item.enhancementLevel] ?? 0;
            const diff = item.count - before;
            inventory[item.itemHrid][item.enhancementLevel] = item.count;
            return {itemHrid: item.itemHrid, count: diff};
        });
    return {
        added: diffs.filter(diff => diff.count > 0),
        removed: diffs.filter(diff => diff.count < 0),
    }
}
