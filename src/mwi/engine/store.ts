import {useEffect, useState} from "react";
import {BehaviorSubject, ReplaySubject} from "rxjs";
import {log} from "../../shared/log";
import {loadSettings} from "../settings";

export interface CharacterStore<T> {
    name: string
    data$: ReplaySubject<T>
    data: T

    dataOrNull(): T | null
}

export enum StoreMode {
    Memory = "memory",
    Local = "local",
}

export function createCharacterStore<T>(name: string, mode = StoreMode.Memory): CharacterStore<T> {
    return new CharacterStoreImpl(name, mode);
}

export function useStoreData<T>(store: CharacterStore<T>): T | null {
    const [data, setData] = useState(store.dataOrNull());

    useEffect(() => {
        const subscription = store.data$.subscribe(setData);
        return () => subscription.unsubscribe();
    });

    return data
}


class CharacterStoreImpl<T> implements CharacterStore<T> {
    readonly name: string;
    readonly mode: StoreMode;
    private _data: T | null = null;
    data$ = new ReplaySubject<T>(1);

    constructor(name: string, mode: StoreMode) {
        this.name = name;
        this.mode = mode;
        this.modeInit()
    }

    get data(): T {
        if (!this._data) {
            throw new Error("Data not initialized");
        }
        return this._data;
    }

    set data(data: T) {
        const changed = this._data !== data;
        if (changed) {
            this._data = data;
            this.modeUpdate(data);
            this.data$.next(data);
        }
    }

    private modeInit() {
        switch (this.mode) {
            case StoreMode.Local:
                let rawData = GM_getValue(`character-store.${this.name}`, null);
                if (rawData) {
                    this.data = JSON.parse(rawData);
                }
                break;
        }
    }

    private modeUpdate(data: T) {
        switch (this.mode) {
            case StoreMode.Local:
                GM_setValue(`character-store.${this.name}`, JSON.stringify(data));
                break;
        }
    }

    dataOrNull(): T | null {
        return this._data;
    }
}


export interface StoreDefine<T> {
    id: string;
    name: string;
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

export function getStoreData<T>({id, defaultValue}: StoreDefine<T>): StoredValue<T> {
    const data = GM_getValue(`store.${id}`, null);
    if (data === null) {
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
    }
    const storedData: StoredValue<T> = {updated: Date.now(), data};
    log("update-store-data", {store, storedData});
    GM_setValue(`store.${id}`, JSON.stringify(storedData));
}

export function resetStoreData<T>(store: StoreDefine<T>) {
    const {id, defaultValue} = store;
    const storedData: StoredValue<T> = {updated: Date.now(), data: defaultValue};
    log("reset-store-data", {store, storedData});
    GM_setValue(`store.${id}`, JSON.stringify(storedData));
}

export function storeSubject<T>(store: StoreDefine<T>): BehaviorSubject<T> {
    const {defaultValue} = store;
    const subject = new BehaviorSubject<T>(defaultValue);
    const data = getStoreData<T>(store);
    log("use-store-data", {store, data});
    if (data.data !== null) {
        subject.next(data.data);
    }
    subject.subscribe(data => updateStoreData(store, data));
    return subject;
}


export function exportStore<T>(store: StoreDefine<T>) {
    const blob = new Blob([JSON.stringify(getStoreData(store))], {type: "application/json;charset=utf-8"});
    window.open(window.URL.createObjectURL(blob));
}