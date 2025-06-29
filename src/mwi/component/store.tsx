import * as React from "react";
import {exportStore, resetStoreData, type StoreDefine} from "../engine/store";
import {saveSettings, useSettings} from "../settings";


export function ShowStoreActions<T>({store}: { store: StoreDefine<T> }) {
    const {id, name} = store;
    const enable = useSettings(`store.${id}.enable`, true);

    return <div>
        {name} store
        <input type="checkbox" checked={enable} onChange={(e) => saveSettings(`store.${id}.enable`,
            e.target.checked)}/>
        <button onClick={() => resetStoreData(store)}>Clear</button>
        <button onClick={() => exportStore(store)}>Save as</button>
    </div>
}
