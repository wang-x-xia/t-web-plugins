import * as React from "react";
import {useMemo} from "react";
import {filter, map} from "rxjs";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {exportStore, getStoreSize, resetStoreData, type StoreDefine, StoreSizeChange$} from "../engine/store";
import {saveSettings, useSettings} from "../settings";
import {ShowSize} from "./number";


export function ShowStoreActions<T>({store}: { store: StoreDefine<T> }) {
    const {id, name} = store;
    const enable = useSettings(`store.${id}.enable`, true);
    const size$ = useMemo(() => StoreSizeChange$.pipe(
            filter(it => it.store.id === id),
            map(it => it.size),
        ),
        [id]);
    const size = useLatestOrDefault(size$, getStoreSize(store));

    return <div>
        {name} store
        <input type="checkbox" checked={enable} onChange={(e) => saveSettings(`store.${id}.enable`,
            e.target.checked)}/>
        <span>Used space: <ShowSize value={size}/></span>
        <button onClick={() => resetStoreData(store)}>Clear</button>
        <button onClick={() => exportStore(store)}>Save as</button>
    </div>
}
