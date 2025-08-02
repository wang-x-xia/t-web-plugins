import {BehaviorSubject, Subject} from "rxjs";
import {getStringValue, setStringValue} from "./kv";
import {log, warn} from "./log";

export const StoreSizeChange$ = new Subject<{ store: StoreDefinition<any>, size: number }>();

export type StoreDataOfSubject<T extends BehaviorSubject<any>> = T["value"]

export interface StoreDefinition<T> {
    id: string;
    name: string;
    path$: BehaviorSubject<string | null>;
    defaultValue: T;
}

export interface Store<T> extends StoreDefinition<T> {
    data$: BehaviorSubject<T>;

    update(dataOrFn: T | ((data: T) => T)): void;

    reset(): void;
}

const initData: Record<string, StoredValue<any>> = {};

export function createStore<T, Base extends StoreDefinition<T>>(store: Base): Base & Store<T> {
    function createStoreSubject(): BehaviorSubject<T> {
        const {defaultValue} = store;
        const subject = new BehaviorSubject<T>(defaultValue);

        function initStoreData() {
            const data = getStoreData(store);
            log("init-store-data", {store, data});
            if (data.data !== null) {
                initData[store.id] = data;
                subject.next(data.data);
            }
        }

        store.path$.subscribe(path => {
            if (path !== null) {
                initStoreData();
            } else {
                subject.next(defaultValue);
            }
        });
        return subject;
    }

    const result = store as (Base & Store<T>);
    result.data$ = createStoreSubject();
    result.update = (data) => {
        let next: T;
        if (typeof data === "function") {
            const previousData = result.data$.getValue();
            next = (data as (data: T) => T)(previousData);
            if (next === previousData) {
                return;
            }
        } else {
            next = data;
        }
        // Save it first
        saveStoreData(store, next)
        result.data$.next(next);
        return;
    };
    result.reset = () => {
        saveStoreData(store, store.defaultValue);
        result.data$.next(store.defaultValue);
    };
    return result;
}

export interface StoredValue<T> {
    updated: number;
    data: T | null;
}

function getStoreKey(store: StoreDefinition<any>) {
    const path = store.path$.getValue();
    if (path === null) {
        warn("no-store-path", {store});
        throw new Error("no-store-path");
    }
    if (path === "") {
        return `store.${store.id}`;
    } else {
        return `store.${store.id}.${path}`;
    }
}

function getStoreData<T>(store: StoreDefinition<T>): StoredValue<T> {
    const {defaultValue} = store
    const data = getStringValue(getStoreKey(store), null);
    if (data === null) {
        return {
            updated: 0,
            data: defaultValue
        };
    }
    return JSON.parse(data);
}

function saveStoreData<T>(store: StoreDefinition<T>, data: T) {
    const storedData: StoredValue<T> = {updated: Date.now(), data};
    log("update-store-data", {store, storedData});
    const json = JSON.stringify(storedData);
    setStringValue(getStoreKey(store), json);
    StoreSizeChange$.next({store, size: json.length});
}

export function exportStore<T>(store: Store<T>) {
    const blob = new Blob([JSON.stringify(getStoreData(store))], {type: "application/json;charset=utf-8"});
    window.open(window.URL.createObjectURL(blob));
}

export function getStoreSize<T>(store: Store<T>): number {
    const data = getStoreData(store);
    return JSON.stringify(data).length;
}