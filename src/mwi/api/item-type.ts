import type {DropInfo} from "./action-type";
import type {BuffDetails, NoncombatBuffs} from "./buff-type";
import type {HridInfo, ItemCount, LevelRequirement} from "./common-type";

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
        buffs: BuffDetails[] | null,
    }
    alchemyDetail?: {
        bulkMultiplier: number
        isCoinifiable: true
        decomposeItems: ItemCount[]
        transmuteSuccessRate: number
        transmuteDropTable: DropInfo[]
    }
    equipmentDetail?: {
        type: string
        levelRequirement: LevelRequirement[]
        combatStats: any
        noncombatStats: NoncombatBuffs
        combatEnhancementBonuses: Record<string, number>
        noncombatEnhancementBonuses: NoncombatBuffs
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