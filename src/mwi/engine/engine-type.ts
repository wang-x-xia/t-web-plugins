import type {NoncombatBuffs} from "../api/buff-type";
import type {CharacterFoodDrinkSlot, CharacterSkill} from "../api/character-type";
import {type AnyActionType} from "./action";

export interface EngineCharacter {
    skills: Record<AnyActionType, CharacterSkill | null>
    drinkSlots: Record<string, (CharacterFoodDrinkSlot | null)[]>
    noncombatStats: NoncombatBuffs,
}

