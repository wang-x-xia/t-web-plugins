import {log} from "../../shared/log";
import type {ActionData} from "../api/action-type";
import type {CharacterSkill} from "../api/character-type";
import type {InitCharacterData} from "../api/message-type";
import {AllActionType, type AnyActionType} from "./action";
import {CharacterLoadedEvent, InitCharacterSubject} from "./engine-event";
import type {EngineCharacter} from "./engine-type";
import {getSkillHrid} from "./hrid";
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
        ...initSkill(data),
    }
    log("character-initialized", {"character": store.data});
    CharacterLoadedEvent.complete();
});

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