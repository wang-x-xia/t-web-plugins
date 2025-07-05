import type {Subject} from "rxjs";
import {log} from "../../shared/log";
import type {ActionCompletedData} from "../api/message-type";
import {updateActionData} from "./action-queue";
import {
    ActionCompleteData$,
    ActionCompleteEvent,
    ActionsUpdatedData$,
    BuyMooPassWithCowbells$,
    ClaimAllMarketListings$,
    ClaimCharacterQuest$,
    ClaimMarketListing$,
    InitCharacterData$,
    InitClientSubject,
    ItemUpdatedData$,
    LootLogData$,
    LootOpened$,
    OpenLoot$,
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
    tryPublish(data, BuyMooPassWithCowbells$, "buy_moo_pass_with_cowbells") ||
    tryPublish(data, ClaimAllMarketListings$, "claim_all_market_listings") ||
    tryPublish(data, ClaimCharacterQuest$, "claim_character_quest") ||
    tryPublish(data, ClaimMarketListing$, "claim_market_listing") ||
    tryPublish(data, OpenLoot$, "open_loot") ||
    tryPublish(data, PostMarketOrder$, "post_market_order");
}


function processResponse(data: any) {
    if (!data.hasOwnProperty("type") || typeof data.type !== "string") {
        // ignore unknown messages
        return;
    }
    if (["chat_message_updated", "chat_message_received", "pong"].includes(data.type)) {
        // ignore chat messages
        return;
    }
    log("handle-response", {"type": data.type, "data": data});
    if (tryPublish(data, ActionCompleteData$, "action_completed")) {
        processActionComplete(data);
        return;
    }
    tryPublish(data, ActionsUpdatedData$, "actions_updated") ||
    tryPublish(data, InitCharacterData$, "init_character_data") ||
    tryPublish(data, InitClientSubject, "init_client_data") ||
    tryPublish(data, ItemUpdatedData$, "items_updated") ||
    tryPublish(data, LootLogData$, "loot_log_updated") ||
    tryPublish(data, LootOpened$, "loot_opened");
}


function tryPublish<T extends { type: string }>(data: any, source: Subject<T>, type: T["type"]): boolean {
    if (data.type !== type) {
        return false;
    }
    source.next(data);
    return true;
}


function processActionComplete(data: ActionCompletedData) {
    const count = updateActionData(data.endCharacterAction);
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