import {getClientData} from "./client";

export function getItemName(itemHrid: string): string {
    return getClientData().itemDetailMap[itemHrid]?.name ?? itemHrid;
}


export enum SpecialItems {
    Coin = "/items/coin",
    CowBell = "/items/cowbell",
    BagOf10CowBells = "/items/bag_of_10_cowbells",
}

export enum ItemCategory {
    AbilityBook = "/item_categories/ability_book",
    Currency = "/item_categories/currency",
    Drink = "/item_categories/drink",
    Equipment = "/item_categories/equipment",
    Food = "/item_categories/food",
    Key = "/item_categories/key",
    Loot = "/item_categories/loot",
    Resource = "/item_categories/resource",
    Unknown = "/item_categories/unknown",
}

export interface OpenableItem {
    hrid: string;
    selfDrop: number;
    drops: Record<string, number>
}

export function isItemOpenable(itemHrid: string): boolean {
    return getClientData().openableLootDropMap[itemHrid] !== undefined;
}

export function getOpenableItem(itemHrid: string): OpenableItem | null {
    if (!isItemOpenable(itemHrid)) {
        return null;
    }
    const dropInfos = getClientData().openableLootDropMap[itemHrid];
    const selfDrop = dropInfos.filter((dropInfo) => dropInfo.itemHrid === itemHrid)
        .reduce((acc, dropInfo) => acc +
            (dropInfo.dropRate * (dropInfo.maxCount + dropInfo.minCount) / 2), 0);
    const drops = dropInfos.filter((dropInfo) => dropInfo.itemHrid !== itemHrid)
        .reduce((acc, dropInfo) => {
            acc[dropInfo.itemHrid] = (acc[dropInfo.itemHrid] ?? 0) + dropInfo.dropRate * (dropInfo.maxCount + dropInfo.minCount) / 2;
            return acc;
        }, {} as Record<string, number>);
    return {
        hrid: itemHrid,
        selfDrop,
        drops,
    }
}

export function getItemCategory(itemHrid: string): ItemCategory {
    return (getClientData().itemDetailMap[itemHrid]?.categoryHrid as ItemCategory) ?? ItemCategory.Unknown;
}