import type {CharacterFoodDrinkSlot, CharacterSkill, NoncombatStats} from "../api/character-type";
import {type AnyActionType} from "./action";
import {type Buff} from "./buff";

export interface EngineCharacter {
    skills: Record<AnyActionType, CharacterSkill | null>
    drinkSlots: Record<string, (CharacterFoodDrinkSlot | null)[]>
    noncombatStats: NoncombatStats,
    buffs: Buff[]
}

