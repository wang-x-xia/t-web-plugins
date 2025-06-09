import type {DropInfo} from "./action-type";
import type {HridInfo} from "./common-type";


export interface AbilityDetails extends HridInfo {
    description: string
    isSpecialAbility: boolean
    manaCost: number
    cooldownDuration: number
    castDuration: number
    abilityEffects: AbilityEffect[]
    defaultCombatTriggers: CombatTrigger[],
}

export interface AbilityEffect {
    targetType: string
    effectType: string
    combatStyleHrid: string
    damageType: string
}

export interface CombatTrigger {
    dependencyHrid: string
    conditionHrid: string
    comparatorHrid: string
    value: number
}

export interface CombatMonsterDetails extends HridInfo {
    combatDetails: any
    elite1CombatDetails: any
    elite2CombatDetails: any
    abilities: any[]
    dropTable: any[]
}

export interface CombatTriggerDependencyDetails extends HridInfo {
    isSingleTarget: boolean
    isMultiTarget: boolean
}


export interface CombatTriggerConditionDetails extends HridInfo {
    isSingleTarget: boolean
    isMultiTarget: boolean
    allowedComparatorHrids: string[]
}


export interface CombatTriggerComparatorDetails extends HridInfo {
    allowValue: boolean
}

export interface CombatZoneInfo {
    isDungeon: boolean
    fightInfo: FightInfo
    dungeonInfo: DungeonInfo
}

export interface FightInfo {
    randomSpawnInfo: any
    bossSpawns: null | any
    battlesPerBoss: number
}

export interface DungeonInfo {
    keyItemHrid: string
    rewardDropTable: DropInfo[] | null
    maxWaves: number
    randomSpawnInfoMap: null | any
    fixedSpawnsMap: null | any
}