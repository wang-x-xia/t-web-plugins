import {useEffect, useState} from "react";
import {ReplaySubject} from "rxjs";

export interface CharacterStore<T> {
    name: string
    dataSubject: ReplaySubject<T>
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
        const subscription = store.dataSubject.subscribe(setData);
        return () => subscription.unsubscribe();
    });

    return data
}


class CharacterStoreImpl<T> implements CharacterStore<T> {
    readonly name: string;
    readonly mode: StoreMode;
    private _data: T | null = null;
    dataSubject = new ReplaySubject<T>(1);

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
            this.dataSubject.next(data);
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