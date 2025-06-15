import {log} from "../../shared/log";
import {initCharacterData} from "./character";
import {initClientData} from "./client";
import {updateLootLog} from "./loot";

export function setupEngineHook() {
    unsafeWindow.WebSocket = new Proxy(WebSocket, {
        construct(target, args: ConstructorParameters<typeof WebSocket>) {
            log("ws-created", {"args": args});
            const ws = new target(...args);
            ws.addEventListener("message", (event) => {
                processMessage(JSON.parse(event.data));
            });
            return ws;
        }
    });
    log("ws-hooked", {});
    if (localStorage.getItem("initClientData") != null) {
        processMessage(JSON.parse(localStorage.getItem("initClientData")!!));
    }
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
    log("handle-message", {"type": data.type, "data": data});
    switch (data.type) {
        case "init_character_data":
            initCharacterData(data);
            break;
        case "init_client_data":
            initClientData(data);
            break;
        case "loot_log_updated":
            updateLootLog(data);
            break;
    }
}
