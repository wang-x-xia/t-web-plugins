import type {HridInfo} from "./common-type";


export interface BuffTypeDetails extends HridInfo {
    isCombat: boolean
    description: string
    debuffDescription: string
}

export interface BuffDetails {
    uniqueHrid: string
    typeHrid: string
    ratioBoost: number
    ratioBoostLevelBonus: number
    flatBoost: number
    flatBoostLevelBonus: number
    startTime: string,
    duration: number
}

export interface CommunityBuffTypeDetails extends HridInfo {
    description: string
    usableInActionTypeMap: Record<string, true>
    buff: BuffDetails
}


interface ActionForBuff {
    alchemy: number
    brewing: number
    cheesesmithing: number
    cooking: number
    crafting: number
    enhancing: number
    foraging: number
    milking: number
    skilling: number
    tailoring: number
    woodcutting: number
}

export type NoncombatBuffs = {
    drinkConcentration?: number
    gatheringQuantity?: number
    taskSpeed?: number

    enhancingSuccess?: number

    skillingEssenceFind?: number
} & {
    // Efficiency
    [P in keyof Exclude<ActionForBuff, "enhancing"> as `${P}Efficiency`]?: number
} & {
    // Experience
    [P in keyof ActionForBuff as `${P}Experience`]?: number
} & {
    // RareFind
    [P in keyof ActionForBuff as `${P}RareFind`]?: number
} & {
    // Speed
    [P in keyof ActionForBuff as `${P}Speed`]?: number
}
