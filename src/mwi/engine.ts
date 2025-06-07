import {LifecycleEvent, triggerLifecycleEvent} from "./lifecycle";
import type {CharacterSkill, InitCharacterData} from "./type";

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

interface EngineCharacter {
    skills: Record<string, CharacterSkill>;
}

export function currentCharacter(): EngineCharacter {
    if (!character) {
        throw new Error("Character not initialized");
    }
    return character;
}


function initCharacterData(data: InitCharacterData) {
    character = {
        skills: data.characterSkills.reduce((acc, skill) => {
            acc[skill.skillHrid] = skill;
            return acc;
        }, {} as Record<string, CharacterSkill>)
    }
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
