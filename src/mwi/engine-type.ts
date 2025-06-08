import type {CharacterFoodDrinkSlot, CharacterSkill, NoncombatStats} from "./api-type";
import {type Action, BuffSource, BuffType} from "./hrid";

export interface EngineCharacter {
    skills: Record<Action, CharacterSkill | null>
    drinkSlots: Record<string, (CharacterFoodDrinkSlot | null)[]>
    noncombatStats: NoncombatStats,
    buffs: EngineBuff[]
}

export interface EngineBuff {
    action: Action,
    type: BuffType,
    source: BuffSource,
    ratioBoost: number
    ratioBoostLevelBonus: number
    flatBoost: number
    flatBoostLevelBonus: number
}