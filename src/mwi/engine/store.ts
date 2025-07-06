import {BehaviorSubject, Subject} from "rxjs";
import {info, log} from "../../shared/log";
import {loadSettings} from "../settings";
import {InitCharacterData$} from "./engine-event";
import {isTestServer} from "./server";

const CharacterId$ = new BehaviorSubject<string | null>(null);

InitCharacterData$.subscribe(data => {
    CharacterId$.next(data.character.id);
});

export const StoreSizeChange$ = new Subject<{ store: StoreDefine<any>, size: number }>();

export type StoreDataOfSubject<T extends BehaviorSubject<any>> = T["value"]

export interface StoreDefine<T> {
    id: string;
    name: string;
    /**
     * The store is character based
     */
    characterBased: boolean;
    /**
     * Allow use settings to enable/disable store.
     */
    enableSettings: boolean;
    defaultValue: T;
}

export interface StoredValue<T> {
    updated: number;
    data: T | null;
}

export function getStoreKey(store: StoreDefine<any>) {
    if (store.characterBased) {
        return `store.${store.id}.character.${CharacterId$.getValue()}`;
    }
    if (isTestServer()) {
        return `store.${store.id}.test`;
    } else {
        return `store.${store.id}`;
    }
}

export function getStoreData<T>(store: StoreDefine<T>): StoredValue<T> {
    const {defaultValue} = store
    const data = GM_getValue(getStoreKey(store), null);
    if (data === null) {
        if (store.characterBased) {
            // Migrate
            const legacy = GM_getValue(`store.${store.id}`, null)
            if (legacy) {
                info("migrate-store", {store});
                GM_deleteValue(`store.${store.id}`);
                return JSON.parse(legacy);
            }
        }
        return {
            updated: 0,
            data: defaultValue
        };
    }
    return JSON.parse(data);
}

export function updateStoreData<T>(store: StoreDefine<T>, data: T) {
    const {id, enableSettings} = store;
    if (enableSettings && !loadSettings(`store.${id}.enable`, true)) {
        log("skip-update-store-data", {store, data});
        return;
    }
    const storedData: StoredValue<T> = {updated: Date.now(), data};
    log("update-store-data", {store, storedData});
    const json = JSON.stringify(storedData);
    GM_setValue(getStoreKey(store), json);
    StoreSizeChange$.next({store, size: json.length});
}

export function resetStoreData<T>(store: StoreDefine<T>) {
    const {defaultValue} = store;
    const storedData: StoredValue<T> = {updated: Date.now(), data: defaultValue};
    log("reset-store-data", {store, storedData});
    GM_setValue(getStoreKey(store), JSON.stringify(storedData));
    StoreSizeChange$.next({store, size: 0});
}

export function storeSubject<T>(store: StoreDefine<T>): BehaviorSubject<T> {
    const {defaultValue} = store;
    const subject = new BehaviorSubject<T>(defaultValue);

    function initStoreData() {
        const data = getStoreData(store);
        log("use-store-data", {store, data});
        if (data.data !== null) {
            subject.next(data.data);
        }
    }

    if (store.characterBased) {
        CharacterId$.subscribe(() => initStoreData());
    } else {
        initStoreData();
    }
    subject.subscribe(data => updateStoreData(store, data));
    return subject;
}


export function exportStore<T>(store: StoreDefine<T>) {
    const blob = new Blob([JSON.stringify(getStoreData(store))], {type: "application/json;charset=utf-8"});
    window.open(window.URL.createObjectURL(blob));
}

export function getStoreSize<T>(store: StoreDefine<T>): number {
    const data = getStoreData(store);
    return JSON.stringify(data).length;
}