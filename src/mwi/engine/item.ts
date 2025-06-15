import {getClientData} from "./client";

export function getItemName(itemHrid: string): string {
    return getClientData().itemDetailMap[itemHrid]?.name ?? itemHrid;
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