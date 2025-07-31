import {BehaviorSubject, Subject} from "rxjs";
import {getStringValue, setStringValue} from "../../shared/kv";
import {info, log} from "../../shared/log";
import {createBoolSetting, getSetting, type Setting} from "../../shared/settings";
import {InitCharacterId$} from "./engine-event";
import {isTestServer} from "./server";

const CharacterId$ = new BehaviorSubject<string | null>(null);

InitCharacterId$.subscribe(data => {
    CharacterId$.next(data);
});

export const StoreSizeChange$ = new Subject<{ store: StoreDefinition<any>, size: number }>();

export type StoreDataOfSubject<T extends BehaviorSubject<any>> = T["value"]

export interface StoreDefinition<T> {
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

    enableSetting: Setting<boolean> | null;

    data$: BehaviorSubject<T>;
    runtime: StoreRuntime
}

export interface StoreRuntime {
    initData?: StoredValue<any>
}

export function defineStore<T>(store: Omit<StoreDefinition<T>, "enableSetting" | "data$" | "runtime">) {
    const result: StoreDefinition<T> = {
        ...store,
        enableSetting: store.enableSettings ? createBoolSetting(`store.${store.id}.enable`, store.name, true) : null,
        data$: null as any,
        runtime: {}
    }
    result.data$ = createStoreSubject(result);
    return result;
}

export interface StoredValue<T> {
    updated: number;
    data: T | null;
}

export function getStoreKey(store: StoreDefinition<any>) {
    if (store.characterBased) {
        return `store.${store.id}.character.${CharacterId$.getValue()}`;
    }
    if (isTestServer()) {
        return `store.${store.id}.test`;
    } else {
        return `store.${store.id}`;
    }
}

export function getStoreData<T>(store: StoreDefinition<T>): StoredValue<T> {
    const {defaultValue} = store
    const data = getStringValue(getStoreKey(store), null);
    if (data === null) {
        if (store.characterBased) {
            // Migrate
            const legacy = getStringValue(`store.${store.id}`, null)
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

export function updateStoreData<T>(store: StoreDefinition<T>, data: T) {
    const {enableSetting} = store;
    if (enableSetting !== null) {
        if (!getSetting(enableSetting)) {
            log("skip-update-store-data", {store, data});
            return;
        }
    }
    if (data === store.runtime.initData?.data) {
        log("skip-update-init-store-data", {store, data});
        return;
    }
    const storedData: StoredValue<T> = {updated: Date.now(), data};
    log("update-store-data", {store, storedData});
    const json = JSON.stringify(storedData);
    setStringValue(getStoreKey(store), json);
    StoreSizeChange$.next({store, size: json.length});
}

export function resetStoreData<T>(store: StoreDefinition<T>) {
    const {defaultValue} = store;
    const storedData: StoredValue<T> = {updated: Date.now(), data: defaultValue};
    log("reset-store-data", {store, storedData});
    setStringValue(getStoreKey(store), JSON.stringify(storedData));
    StoreSizeChange$.next({store, size: 0});
}

function createStoreSubject<T>(store: StoreDefinition<T>): BehaviorSubject<T> {
    const {defaultValue} = store;
    const subject = new BehaviorSubject<T>(defaultValue);

    function initStoreData() {
        const data = getStoreData(store);
        log("init-store-data", {store, data});
        if (data.data !== null) {
            store.runtime.initData = data;
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

export function storeSubject<T>(store: StoreDefinition<T>): BehaviorSubject<T> {
    return store.data$;
}


export function exportStore<T>(store: StoreDefinition<T>) {
    const blob = new Blob([JSON.stringify(getStoreData(store))], {type: "application/json;charset=utf-8"});
    window.open(window.URL.createObjectURL(blob));
}

export function getStoreSize<T>(store: StoreDefinition<T>): number {
    const data = getStoreData(store);
    return JSON.stringify(data).length;
}