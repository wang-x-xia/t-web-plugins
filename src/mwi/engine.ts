import type {CharacterSkill, InitCharacterData} from "./api-type";
import type {EngineBuff, EngineCharacter} from "./engine-type";
import {Action, getActionByHrid, getBuffSourceByHrid, getBuffTypeByHrid, getSkillHrid} from "./hrid";
import {LifecycleEvent, triggerLifecycleEvent} from "./lifecycle";

export function setupEngineHook() {
    unsafeWindow.WebSocket = new Proxy(WebSocket, {
        construct(target, args: ConstructorParameters<typeof WebSocket>) {
            console.log({"log-event": "ws-created", "args": args});
            const ws = new target(...args);
            ws.addEventListener("message", (event) => {
                processMessage(JSON.parse(event.data));
            });
            return ws;
        }
    });
    console.log({"log-event": "ws-hooked"});
}

let character: EngineCharacter;

export function currentCharacter(): EngineCharacter {
    if (!character) {
        throw new Error("Character not initialized");
    }
    return character;
}


function initCharacterData(data: InitCharacterData) {
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


function processMessage(data: any) {
    if (!data.hasOwnProperty("type") || typeof data.type !== "string") {
        // ignore unknown messages
        return;
    }
    if (data.type === "chat_message_received") {
        // ignore chat messages
        return;
    }
    console.log({"log-event": "handle-message", "data": data});
    switch (data.type) {
        case "init_character_data":
            initCharacterData(data);
            break;
    }
}
