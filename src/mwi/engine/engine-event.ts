import {combineLatest, ReplaySubject, Subject, take} from "rxjs";
import type {
    ActionCompletedData,
    ActionsUpdatedData,
    InitCharacterData,
    InitClientData,
    ItemUpdatedData,
    LootLogData
} from "../api/message-type";
import type {ClaimMarketListing, PostMarketOrder} from "../api/request-message-type";
import type {ItemChangesData} from "./inventory";

// Request
export const ClaimMarketListing$ = new Subject<ClaimMarketListing>();
export const PostMarketOrder$ = new Subject<PostMarketOrder>();

// Response
export const InitCharacterData$ = new ReplaySubject<InitCharacterData>(1);
export const LootLogData$ = new ReplaySubject<LootLogData>(1);
export const ActionCompleteData$ = new Subject<ActionCompletedData>();
export const ItemUpdatedData$ = new Subject<ItemUpdatedData>();
export const ActionsUpdatedData$ = new Subject<ActionsUpdatedData>();


export const CharacterLoadedEvent = InitCharacterData$.pipe(take(1));
export const MarketLoadedEvent = new Subject();
export const AllLoadedEvent = combineLatest([CharacterLoadedEvent, MarketLoadedEvent]);
export const InitCharacterSubject = InitCharacterData$;
export const InitClientSubject = new ReplaySubject<InitClientData>(1);
export const LootLogSubject = LootLogData$;

export interface ActionCompleteEventData extends ItemChangesData {
    hrid: string,
    count: number,
    updatedAt: string,
}

export const ActionCompleteEvent = new Subject<ActionCompleteEventData>();
