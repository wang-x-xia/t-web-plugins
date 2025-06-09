import {initCharacterData} from "./character";
import {initClientData} from "./client";

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
    console.log({"log-event": "handle-message", "type": data.type, "data": data});
    switch (data.type) {
        case "init_character_data":
            initCharacterData(data);
            break;
        case "init_client_data":
            initClientData(data);
            break;
    }
}
