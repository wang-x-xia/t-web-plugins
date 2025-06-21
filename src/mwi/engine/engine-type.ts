import type {CharacterFoodDrinkSlot, CharacterSkill, NoncombatStats} from "../api/character-type";
import {type AnyActionType} from "./action";

export interface EngineCharacter {
    skills: Record<AnyActionType, CharacterSkill | null>
    drinkSlots: Record<string, (CharacterFoodDrinkSlot | null)[]>
    noncombatStats: NoncombatStats,
}

