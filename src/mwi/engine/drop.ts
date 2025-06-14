export enum DropType {
    Common = "common",
    Essence = "essence",
    Rare = "rare",
}

export interface DropItem {
    itemHrid: string
    type: DropType
    dropRate: number
    minCount: number
    maxCount: number
}
