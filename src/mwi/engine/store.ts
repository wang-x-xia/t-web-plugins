import {useEffect, useState} from "react";
import {Subject} from "rxjs";

export interface CharacterStore<T> {
    name: string
    dataSubject: Subject<T>
    data: T

    dataOrNull(): T | null
}

export function createCharacterStore<T>(name: string): CharacterStore<T> {
    return new CharacterStoreImpl(name);
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
    private _data: T | null = null;
    dataSubject = new Subject<T>();

    constructor(name: string) {
        this.name = name;
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
            this.dataSubject.next(data);
        }
    }

    dataOrNull(): T | null {
        return this._data;
    }
}