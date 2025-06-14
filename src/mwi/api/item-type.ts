import type {BuffUniqueDetails} from "./buff-type";
import type {HridInfo} from "./common-type";

export interface ItemDetails extends HridInfo {
    description: string
    categoryHrid: string
    sellPrice: number
    isTradable?: true
    isOpenable?: true
    itemLevel: number
    consumableDetail?: {
        cooldownDuration: number
        usableInActionTypeMap: Record<string, true>
        buffs: BuffUniqueDetails[] | null,
    }

    [key: string]: any
}

export interface ItemCategoryDetails extends HridInfo {
    pluralName: string
}

export interface ItemLocationDetails extends HridInfo {
    type: string
    isTool: boolean
    isMultiItem: boolean
    conflictingOtherItemLocationHrids: string[]
}