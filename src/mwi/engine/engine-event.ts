import {ReplaySubject, Subject} from "rxjs";
import type {ItemCount} from "../api/common-type";
import type {InitCharacterData, InitClientData, LootLogData} from "../api/message-type";

export const CharacterLoadedEvent = new Subject<null>();
export const InitCharacterSubject = new ReplaySubject<InitCharacterData>(1);
export const InitClientSubject = new ReplaySubject<InitClientData>(1);
export const LootLogSubject = new ReplaySubject<LootLogData>();

export interface ActionCompleteEventData {
    hrid: string,
    count: number,
    updatedAt: string,
    added: ItemCount[],
    removed: ItemCount[]
}

export const ActionCompleteEvent = new Subject<ActionCompleteEventData>();
