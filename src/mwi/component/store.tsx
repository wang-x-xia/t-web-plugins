import * as React from "react";
import {useMemo} from "react";
import {filter, map} from "rxjs";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {ShowSettingValue} from "../../shared/settings";
import {exportStore, getStoreSize, resetStoreData, type StoreDefinition, StoreSizeChange$} from "../engine/store";
import {ShowSize} from "./number";

import viewStyles from "./view.module.css";

export function ShowStoreActions<T>({store}: { store: StoreDefinition<T> }) {
    const {id, name} = store;
    const size$ = useMemo(() => StoreSizeChange$.pipe(
            filter(it => it.store.id === id),
            map(it => it.size),
        ),
        [id]);
    const size = useLatestOrDefault(size$, getStoreSize(store));

    return <div className={viewStyles["row-group"]}>
        <span>
        {name} store
        </span>
        {store.enableSetting !== null ? <span>
            Enabled:
            <ShowSettingValue setting={store.enableSetting}/>
        </span> : <></>}
        <span>Used space: <ShowSize value={size}/></span>
        <button onClick={() => resetStoreData(store)}>Clear</button>
        <button onClick={() => exportStore(store)}>Save as</button>
    </div>
}
