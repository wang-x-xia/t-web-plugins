import * as React from "react";
import {
    createNumberSetting,
    createStringSelectSetting,
    ShowSettingValue,
    updateSetting,
    useSetting
} from "../../shared/settings";
import {ShowCollectOrManufacturingActions} from "../component/action";
import {ShowBuffByNonCombatActionType} from "../component/buff";
import {ShowPercent} from "../component/number";
import viewStyles from "../component/view.module.css";
import {CollectActionType, ManufacturingActionType} from "../engine/action";
import {AllLoadedEvent} from "../engine/engine-event";
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

const PROFIT_ACTION_SETTING = createStringSelectSetting<CollectActionType | ManufacturingActionType>(
    {id: "profit.action", name: "Action", defaultValue: CollectActionType.Milking}, [
        {name: "Milking", value: CollectActionType.Milking},
        {name: "Foraging", value: CollectActionType.Foraging},
        {name: "Woodcutting", value: CollectActionType.Woodcutting},
        {name: "Cheesesmithing", value: ManufacturingActionType.Cheesesmithing},
        {name: "Crafting", value: ManufacturingActionType.Crafting},
        {name: "Tailoring", value: ManufacturingActionType.Tailoring},
        {name: "Cooking", value: ManufacturingActionType.Cooking},
        {name: "Brewing", value: ManufacturingActionType.Brewing},
    ]);


const DURATION_SETTING = createNumberSetting(
    {id: "profit.duration-hours", name: "Duration", defaultValue: 1}, "integer",
    {min: 1});

const PROFIT_MODE_SETTING = createStringSelectSetting<"avg" | "lucky">(
    {id: "profit.mode", name: "Profit Mode", defaultValue: "avg"}, [
        {name: "Average", value: "avg"},
        {name: "Lucky", value: "lucky"}]);

const LUCKY_SETTING = createNumberSetting(
    {id: "profit.lucky", name: "Lucky", defaultValue: 0}, "float",
    {min: 0.005, max: 0.995, step: 0.005});

export function ShowProfit() {
    const action = useSetting(PROFIT_ACTION_SETTING);
    const hours = useSetting(DURATION_SETTING);
    const mode = useSetting(PROFIT_MODE_SETTING);
    const lucky = useSetting(LUCKY_SETTING);

    return <div>
        <div className={viewStyles["row-group"]}>
            <ShowSettingValue setting={PROFIT_ACTION_SETTING}/>
            <span>
            Duration:
            <input type="number" value={hours} style={{width: "5em"}} onChange={e =>
                updateSetting(DURATION_SETTING, e.target.valueAsNumber)}/>
            hours
            </span>
            <span>
                Mode: <ShowSettingValue setting={PROFIT_MODE_SETTING}/>
            </span>
            {mode === "lucky" ? <span>
            Lucky:
            <ShowPercent value={lucky}/>
            <input type="range" value={lucky} min={0.005} max={0.995} step={0.005} onChange={e =>
                updateSetting(LUCKY_SETTING, e.target.valueAsNumber)}/>
            </span> : <></>
            }
        </div>
        <ShowBuffByNonCombatActionType actionType={action}/>
        <ShowCollectOrManufacturingActions actionType={action} hours={hours} mode={mode} lucky={lucky}/>
    </div>
}
