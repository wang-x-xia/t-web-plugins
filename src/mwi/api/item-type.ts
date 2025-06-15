import type {DropInfo} from "./action-type";
import type {BuffUniqueDetails} from "./buff-type";
import type {HridInfo, ItemCount} from "./common-type";

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
    alchemyDetail?: {
        bulkMultiplier: number
        isCoinifiable: true
        decomposeItems: ItemCount[]
        transmuteSuccessRate: number
        transmuteDropTable: DropInfo[]
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