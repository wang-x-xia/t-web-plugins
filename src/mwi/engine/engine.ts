import {log} from "../../shared/log";
import type {ActionCompletedData} from "../api/message-type";
import {updateCurrentActionData} from "./character";
import {
    ActionCompleteData$,
    ActionCompleteEvent,
    ClaimMarketListing$,
    InitCharacterData$,
    InitClientSubject,
    ItemUpdatedData$,
    LootLogData$,
    PostMarketOrder$
} from "./engine-event";
import {updateInventory} from "./inventory";

export function setupEngineHook() {
    unsafeWindow.WebSocket = new Proxy(WebSocket, {
        construct(target, args: ConstructorParameters<typeof WebSocket>) {
            log("ws-created", {"args": args});
            const ws = new target(...args);
            ws.addEventListener("message", (event) => {
                processResponse(JSON.parse(event.data));
            });
            const _send = ws.send.bind(ws);
            ws.send = (data: any) => {
                processRequest(JSON.parse(data));
                _send(data);
            };
            return ws;
        },
    });
    log("ws-hooked", {});
    if (localStorage.getItem("initClientData") != null) {
        processResponse(JSON.parse(localStorage.getItem("initClientData")!!));
    }
}

function processRequest(data: any) {
    if (!data.hasOwnProperty("type") || typeof data.type !== "string") {
        // ignore unknown messages
        return;
    }
    if (["ping"].includes(data.type)) {
        // ignore chat messages
        return;
    }
    log("handle-request", {"type": data.type, "data": data});
    switch (data.type) {
        case "claim_market_listing":
            ClaimMarketListing$.next(data);
            break;
        case "post_market_order":
            PostMarketOrder$.next(data);
            break;
    }
}


function processResponse(data: any) {
    if (!data.hasOwnProperty("type") || typeof data.type !== "string") {
        // ignore unknown messages
        return;
    }
    if (["chat_message_received", "pong"].includes(data.type)) {
        // ignore chat messages
        return;
    }
    log("handle-response", {"type": data.type, "data": data});
    switch (data.type) {
        case "init_character_data":
            InitCharacterData$.next(data);
            break;
        case "init_client_data":
            InitClientSubject.next(data);
            break;
        case "loot_log_updated":
            LootLogData$.next(data);
            break;
        case "action_completed":
            ActionCompleteData$.next(data);
            processActionComplete(data);
            break;
        case "items_updated":
            ItemUpdatedData$.next(data);
            break;
    }
}

function processActionComplete(data: ActionCompletedData) {
    const count = updateCurrentActionData(data.endCharacterAction);
    const {added, removed} = updateInventory(data.endCharacterItems ?? [], {
        type: "action",
        action: data.endCharacterAction.actionHrid,
    });
    ActionCompleteEvent.next({
        hrid: data.endCharacterAction.actionHrid,
        updatedAt: data.endCharacterAction.updatedAt,
        added, removed, count,
    });
}