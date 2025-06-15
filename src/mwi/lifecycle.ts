import {type EventDefine} from "../shared/mq";
import type {ItemCount} from "./api/common-type";


export const CharacterLoadedEvent: EventDefine<null> = {
    type: "character-loaded"
};

export const LootLogUpdatedEvent: EventDefine<null> = {
    type: "loot-log-updated"
};


export interface ActionCompleteEventData {
    hrid: string,
    updatedAt: string,
    added: ItemCount[],
    removed: ItemCount[]
}

export const ActionCompleteEvent: EventDefine<ActionCompleteEventData> = {
    type: "action-complete"
}