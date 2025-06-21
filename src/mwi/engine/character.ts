import {log} from "../../shared/log";
import type {ActionData} from "../api/action-type";
import type {CharacterSkill} from "../api/character-type";
import type {InitCharacterData} from "../api/message-type";
import {AllActionType, type AnyActionType} from "./action";
import type {Buff} from "./buff";
import {CharacterLoadedEvent, InitCharacterSubject} from "./engine-event";
import type {EngineCharacter} from "./engine-type";
import {getActionTypeByTypeHrid, getBuffSourceByHrid, getBuffTypeByHrid, getSkillHrid} from "./hrid";
import {createCharacterStore} from "./store";

const store = createCharacterStore<EngineCharacter>("engine-character");

export function currentCharacterStore() {
    return store;
}

export function currentCharacter(): EngineCharacter {
    return store.data;
}

InitCharacterSubject.subscribe((data: InitCharacterData) => {
    store.data = {
        drinkSlots: data.actionTypeDrinkSlotsMap,
        noncombatStats: data.noncombatStats,
        ...initBuffs(data),
        ...initSkill(data),
    }
    log("character-initialized", {"character": store.data});
    CharacterLoadedEvent.complete();
});

export function initBuffs(data: InitCharacterData): { buffs: Buff[] } {
    const buffs: Buff[] = [data.mooPassActionTypeBuffsMap, data.communityActionTypeBuffsMap, data.houseActionTypeBuffsMap, data.consumableActionTypeBuffsMap, data.equipmentActionTypeBuffsMap]
        .flatMap((buffMap) => Object.entries(buffMap).flatMap(([key, value]) => (value || []).map<Buff | null>((buff) => {
            const action = getActionTypeByTypeHrid(key);
            const type = getBuffTypeByHrid(buff.typeHrid);
            const source = getBuffSourceByHrid(buff.uniqueHrid);
            if (!action || !type || !source) {
                log("invalid-buff", {"action": key, "buff": buff});
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
        .filter(it => it != null)

    return {
        buffs,
    }
}

export function initSkill(data: InitCharacterData): { skills: Record<AnyActionType, CharacterSkill | null> } {
    const skills = Object.values(AllActionType).reduce((acc, key) => ({
        ...acc,
        [key]: data.characterSkills.find((skill) => skill.skillHrid === getSkillHrid(key)) || null,
    }), {} as Record<AnyActionType, CharacterSkill | null>)
    return {
        skills,
    }
}

let currentActionData: ActionData | null = null;

export function updateCurrentActionData(newActionData: ActionData): number {
    const previousAction = currentActionData;
    currentActionData = newActionData;
    if (previousAction?.actionHrid === newActionData.actionHrid) {
        return newActionData.currentCount - previousAction.currentCount;
    }
    return 0;
}