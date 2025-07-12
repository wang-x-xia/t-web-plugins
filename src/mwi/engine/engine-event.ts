import {combineLatest, ReplaySubject, Subject, take} from "rxjs";
import type {
    ActionCompletedData,
    ActionsUpdatedData,
    InitCharacterData,
    InitClientData,
    ItemUpdatedData,
    LootLogData,
    LootOpened
} from "../api/message-type";
import type {
    BuyMooPassWithCowbells,
    ClaimAllMarketListings,
    ClaimCharacterQuest,
    ClaimMarketListing,
    OpenLoot,
    PostMarketOrder
} from "../api/request-message-type";
import type {ItemChangesData} from "./inventory";

// Hook
export const Request$ = new ReplaySubject<any>(Infinity, 300_000);
export const Response$ = new ReplaySubject<any>(Infinity, 300_000);

// Request
export const BuyMooPassWithCowbells$ = new Subject<BuyMooPassWithCowbells>();
export const ClaimAllMarketListings$ = new Subject<ClaimAllMarketListings>();
export const ClaimCharacterQuest$ = new Subject<ClaimCharacterQuest>();
export const ClaimMarketListing$ = new Subject<ClaimMarketListing>();
export const OpenLoot$ = new Subject<OpenLoot>();
export const PostMarketOrder$ = new Subject<PostMarketOrder>();

// Response
export const InitCharacterData$ = new ReplaySubject<InitCharacterData>(1);
export const LootLogData$ = new ReplaySubject<LootLogData>(1);
export const ActionCompleteData$ = new Subject<ActionCompletedData>();
export const ItemUpdatedData$ = new Subject<ItemUpdatedData>();
export const ActionsUpdatedData$ = new Subject<ActionsUpdatedData>();
export const LootOpened$ = new Subject<LootOpened>();


export const CharacterLoadedEvent = InitCharacterData$.pipe(take(1));
export const MarketLoaded$ = new Subject();
export const AllLoadedEvent = combineLatest([CharacterLoadedEvent, MarketLoaded$]);
export const InitCharacterSubject = InitCharacterData$;
export const InitClientSubject = new ReplaySubject<InitClientData>(1);
export const LootLogSubject = LootLogData$;

export interface ActionCompleteEventData extends ItemChangesData {
    hrid: string,
    count: number,
    updatedAt: string,
}

export const ActionCompleteEvent = new Subject<ActionCompleteEventData>();
