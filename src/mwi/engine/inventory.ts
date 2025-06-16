import type {CharacterItem} from "../api/character-type";
import type {ItemCount} from "../api/common-type";
import type {InitCharacterData} from "../api/message-type";


let inventory: Record<string, Record<number, number>> | null = null;

export function initInventory(data: InitCharacterData) {
    const localInventory = {} as Record<string, Record<number, number>>;
    data.characterItems.forEach((item) => {
        if (item.itemLocationHrid !== "/item_locations/inventory") {
            return;
        }
        localInventory[item.itemHrid] = localInventory[item.itemHrid] ?? {}
        localInventory[item.itemHrid][item.enhancementLevel] = item.count;
    });
    inventory = localInventory;
}

function getInventory() {
    if (!inventory) {
        throw new Error("Inventory not initialized");
    }
    return inventory;
}


export function updateInventory(data: CharacterItem[]): { added: ItemCount[], removed: ItemCount[] } {
    const inventory = getInventory();
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


export function getItemFromInventory(hrid: string, enhancementLevel: number = 0): number {
    if (!inventory) {
        throw new Error("Inventory not initialized");
    }
    return inventory[hrid]?.[enhancementLevel] ?? 0;
}
