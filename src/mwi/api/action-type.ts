import type {OwnedByCharacter} from "./character-type";
import type {CombatZoneInfo} from "./combat-type";
import type {HasId, HasTime, HridInfo, ItemCount, LevelRequirement} from "./common-type";


export interface ActionCategoryDetails extends HridInfo {
    type: string
}

export interface ActionDetails extends HridInfo {
    function: string
    type: string
    category: string
    levelRequirement: LevelRequirement
    baseTimeCost: number
    experienceGain: {
        skillHrid: string,
        value: number
    }
    dropTable: DropInfo[] | null
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

export interface ActionData extends HasId, HasTime, OwnedByCharacter {
    partyID: number
    actionHrid: string
    hasMaxCount: boolean
    maxCount: number
    currentCount: number
    wave: number
    primaryItemHash: string
    secondaryItemHash: string
    enhancingMaxLevel: number
    enhancingProtectionMinLevel: number
    characterLoadoutID: number
    ordinal: number
    isDone: boolean
}
