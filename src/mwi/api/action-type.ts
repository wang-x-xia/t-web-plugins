import type {CombatZoneInfo} from "./combat-type";
import type {HridInfo, ItemCount} from "./common-type";


export interface ActionCategoryDetails extends HridInfo {
    type: string
}

export interface ActionDetails extends HridInfo {
    function: string
    type: string
    category: string
    levelRequirement: {
        skillHrid: string,
        level: number
    }
    baseTimeCost: number
    experienceGain: {
        skillHrid: string,
        value: number
    }
    dropTable: null
    essenceDropTable: DropInfo[] | null
    rareDropTable: DropInfo[] | null
    upgradeItemHrid: string
    inputItems: ItemCount[] | null
    outputItems: ItemCount[] | null
    combatZoneInfo: CombatZoneInfo | null
    maxPartySize: number
    buffs: null
}


export interface DropInfo {
    itemHrid: string,
    dropRate: number
    minCount: number
    maxCount: number
    minEliteTier: number
}

