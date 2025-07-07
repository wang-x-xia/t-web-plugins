import * as React from "react";
import {ShowCollectOrManufacturingActions} from "../component/action";
import {ShowBuffByNonCombatActionType} from "../component/buff";
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
    const hours = useSettings("profit.duration-hours", 1);
    const mode = useSettings<"avg" | "lucky">("profit.mode", "avg");
    const lucky = useSettings("profit.lucky", 0);


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
            <input type="number" value={hours} style={{width: "5em"}} onChange={e =>
                saveSettings("profit.duration-hours", e.target.valueAsNumber)}/>
            hours
            </span>
            <span>
                Mode:
                <select value={mode} onChange={e => saveSettings("profit.mode", e.target.value)}>
                    <option value="avg">Average</option>
                    <option value="lucky">Lucky</option>
                </select>
            </span>
            {mode === "lucky" ? <span>
            Lucky:
            <ShowPercent value={lucky}/>
            <input type="range" value={lucky} min={0.005} max={0.995} step={0.005} onChange={e =>
                saveSettings("profit.lucky", e.target.valueAsNumber)}/>
            </span> : <></>
            }
        </div>
        <ShowBuffByNonCombatActionType actionType={action}/>
        <ShowCollectOrManufacturingActions actionType={action} hours={hours} mode={mode} lucky={lucky}/>
    </div>
}
