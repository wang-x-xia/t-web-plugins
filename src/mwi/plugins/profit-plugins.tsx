import * as React from "react";
import {ShowCollectOrManufacturingActions} from "../component/action";
import {ShowBuffByActionType} from "../component/buff";
import {ShowPercent} from "../component/number";
import viewStyles from "../component/view.module.css";
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
    const duration = useSettings<number>("profit.duration-hours", 1);
    const lucky = useSettings<number>("profit.lucky", 0.5);

    return <div>
        <div className={viewStyles["row-group"]}>
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
            <span>
            Duration:
            <input type="number" value={duration} style={{width: "5em"}} onChange={e =>
                saveSettings("profit.duration-hours", e.target.valueAsNumber)}/>
            hours
            </span>
            <span>
            Lucky:
            <ShowPercent value={lucky}/>
            <input type="range" value={lucky} min={0} max={1} step={0.01} onChange={e =>
                saveSettings("profit.lucky", e.target.valueAsNumber)}/>
            </span>
        </div>
        <ShowBuffByActionType actionType={action}/>
        <ShowCollectOrManufacturingActions actionType={action} hour={duration} mode="avg" lucky={lucky}/>
    </div>
}
