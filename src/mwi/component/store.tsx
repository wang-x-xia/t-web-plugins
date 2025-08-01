import * as React from "react";
import {useMemo} from "react";
import {filter, map} from "rxjs";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {ShowSettingValue} from "../../shared/settings";
import {exportStore, getStoreSize, StoreSizeChange$} from "../../shared/store";

import viewStyles from "../../shared/view.module.css";
import type {Store} from "../engine/store";
import {ShowSize} from "./number";

export function ShowStoreActions<T>({store}: { store: Store<T> }) {
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
        <button onClick={() => store.reset()}>Clear</button>
        <button onClick={() => exportStore(store)}>Save as</button>
    </div>
}
