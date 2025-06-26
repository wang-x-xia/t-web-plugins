import * as React from "react";
import {ShowCollectOrManufacturingActions} from "../component/action";
import {ShowBuffByActionType} from "../component/buff";
import {CollectActionType, ManufacturingActionType} from "../engine/action";
import {AllLoadedEvent} from "../engine/engine-event";
import {saveSettings, useSettings} from "../settings";
import {AddView} from "../view";

export function foragingPlugin() {
    AllLoadedEvent.subscribe({
        complete: () => {
            AddView({
                id: "profit",
                name: "Profit",
                node: <ShowProfit/>
            });
        },
    });
}

export function ShowProfit() {
    const action = useSettings("profit.action", CollectActionType.Milking);
    return <div>
        <select value={action} onChange={e => saveSettings("profit.action", e.target.value)}>
            <option value={CollectActionType.Milking}>Milking</option>
            <option value={CollectActionType.Foraging}>Foraging</option>
            <option value={CollectActionType.Woodcutting}>Woodcutting</option>
            <option value={ManufacturingActionType.Cheesesmithing}>Cheesesmithing</option>
            <option value={ManufacturingActionType.Crafting}>Crafting</option>
            <option value={ManufacturingActionType.Tailoring}>Tailoring</option>
            <option value={ManufacturingActionType.Cooking}>Cooking</option>
            <option value={ManufacturingActionType.Brewing}>Brewing</option>
        </select>
        <ShowBuffByActionType actionType={action}/>
        <ShowCollectOrManufacturingActions actionType={action}/>
    </div>
}
