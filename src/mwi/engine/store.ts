import {BehaviorSubject} from "rxjs";
import {createBoolSetting, type Setting} from "../../shared/settings";
import {createStore, Store as StoreBase, StoreDefinition as StoreDefinitionBase} from "../../shared/store";
import {InitCharacterId$} from "./engine-event";
import {isTestServer} from "./server";

const CharacterId$ = new BehaviorSubject<string | null>(null);

InitCharacterId$.subscribe(data => {
    CharacterId$.next(`character.${data}`);
});

export type StoreDataOfSubject<T extends BehaviorSubject<any>> = T["value"]

export interface StoreDefinition<T> extends Omit<StoreDefinitionBase<T>, "path$"> {
    /**
     * The store is character based
     */
    characterBased: boolean;
    /**
     * Allow use settings to enable/disable store.
     */
    enableSettings: boolean;
}

export interface Store<T> extends StoreBase<T> {
    enableSetting: Setting<boolean> | null;
}

export function defineStore<T>(def: StoreDefinition<T>): Store<T> {
    const storeDef = def as StoreDefinition<T> & StoreDefinitionBase<T>;
    storeDef.path$ = def.characterBased ? CharacterId$ :
        isTestServer() ? new BehaviorSubject<string | null>("test") : new BehaviorSubject<string | null>("");
    const store = createStore(storeDef) as any as Store<T>;
    store.enableSetting = def.enableSettings ? createBoolSetting(`store.${store.id}.enable`, store.name, true) : null;
    return store;
}
