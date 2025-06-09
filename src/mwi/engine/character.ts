import type {CharacterSkill} from "../api/character-type";
import type {InitCharacterData} from "../api/message-type";
import {Action, getActionByHrid, getBuffSourceByHrid, getBuffTypeByHrid, getSkillHrid} from "../hrid";
import {LifecycleEvent, triggerLifecycleEvent} from "../lifecycle";
import type {EngineBuff, EngineCharacter} from "./engine-type";

let character: EngineCharacter;

export function currentCharacter(): EngineCharacter {
    if (!character) {
        throw new Error("Character not initialized");
    }
    return character;
}

export function initCharacterData(data: InitCharacterData) {
    const buffs: EngineBuff[] = [data.mooPassActionTypeBuffsMap, data.communityActionTypeBuffsMap, data.houseActionTypeBuffsMap, data.consumableActionTypeBuffsMap, data.equipmentActionTypeBuffsMap]
        .flatMap((buffMap) => Object.entries(buffMap).flatMap(([key, value]) => (value || []).map<EngineBuff | null>((buff) => {
            const action = getActionByHrid(key);
            const type = getBuffTypeByHrid(buff.typeHrid);
            const source = getBuffSourceByHrid(buff.uniqueHrid);
            if (!action || !type || !source) {
                console.log({"log-event": "invalid-buff", "action": key, "buff": buff});
                return null;
            }
            return {
                action,
                type,
                source,
                ratioBoost: buff.ratioBoost,
                flatBoost: buff.flatBoost,
                ratioBoostLevelBonus: buff.ratioBoostLevelBonus,
                flatBoostLevelBonus: buff.flatBoostLevelBonus,
            }
        })))
        .filter(it => it != null);
    character = {
        skills: Object.values(Action).reduce((acc, key) => ({
            ...acc,
            [key]: data.characterSkills.find((skill) => skill.skillHrid === getSkillHrid(key)) || null,
        }), {} as Record<Action, CharacterSkill | null>),
        drinkSlots: data.actionTypeDrinkSlotsMap,
        noncombatStats: data.noncombatStats,
        buffs,
    }
    console.log({"log-event": "character-initialized", "character": character});
    triggerLifecycleEvent(LifecycleEvent.CharacterLoaded);
}