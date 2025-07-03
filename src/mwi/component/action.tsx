import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";
import {createGroupOpContext, useChildUpdate, useGroupData} from "../../shared/group";
import {type AnyActionType, CollectActionType, ManufacturingActionType} from "../engine/action";
import {NormalBuffType} from "../engine/buff-type";
import {getClientData} from "../engine/client";
import {InitClientSubject} from "../engine/engine-event";
import {useBuffData} from "./buff";
import {type DropMode, ShowDropIncome} from "./drop";
import {Expandable} from "./expandable";
import {BuyItemTable, type ItemInput, prepareBuyItems} from "./item-table";
import {ShowNumber} from "./number";

const ActionProfitOpContext = createGroupOpContext<number>();

interface ActionProfitConfiguration {
    hour: number;
    mode: DropMode,
    lucky: number;
}

const ActionProfitContext = createContext<ActionProfitConfiguration>({
    hour: 1,
    mode: "avg",
    lucky: 0.5,
});

export function ShowCollectOrManufacturingActions({actionType, hour, mode, lucky}: ActionProfitConfiguration & {
    actionType: CollectActionType | ManufacturingActionType,
}) {
    const [actions, setActions] = useState<Record<string, number>>({});
    useEffect(() => {
        const subscription = InitClientSubject.subscribe(data => {
            const actions = Object.values(data.actionDetailMap)
                .filter(action => action.type === actionType)
                .map(action => {
                    return [action.hrid, 0]
                })
            setActions(Object.fromEntries(actions));
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [actionType]);
    const {data: profit, context} = useGroupData(actions, 0);

    const sortedActions = Object.entries(profit).map(([action, profit]) => ({action, profit}))
        .sort((a, b) => b.profit - a.profit || a.action.localeCompare(b.action));

    return <table>
        <thead>
        <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Stat</th>
            <th>Profit</th>
            <th>Input</th>
            <th>Output</th>
            <th>Buff</th>
        </tr>
        </thead>
        <tbody>
        <ActionProfitOpContext.Provider value={context}>
            <ActionProfitContext.Provider value={{hour, mode, lucky}}>
                {sortedActions.map(action =>
                    <tr key={action.action}>
                        <ShowCollectOrManufacturingAction action={action.action}/>
                    </tr>
                )}
            </ActionProfitContext.Provider>
        </ActionProfitOpContext.Provider>
        </tbody>
    </table>
}

export function ShowCollectOrManufacturingAction({action}: { action: string }) {
    const {hour, mode, lucky} = useContext(ActionProfitContext);

    const actionDetails = getClientData().actionDetailMap[action]
    const baseTimeCost = actionDetails.baseTimeCost / 1e9
    const category = getClientData().actionCategoryDetailMap[actionDetails.category];

    const {buffData, BuffTable} =
        useBuffData(actionDetails.type as AnyActionType, actionDetails.levelRequirement.level);

    const times = hour * 60 * 60 / baseTimeCost * (1 + buffData[NormalBuffType.ActionSpeed]) * (1 + buffData[NormalBuffType.Efficiency]);
    const inputs: ItemInput[] = (actionDetails.inputItems ?? []).map(input => ({
        hrid: input.itemHrid,
        count: input.count * times,
    }));

    const {total: cost} = prepareBuyItems(inputs);
    const [income, setIncome] = useState(0);
    useChildUpdate(ActionProfitOpContext, action, income - cost);

    return <>
        {/* Name */}
        <th>{actionDetails.name}</th>
        {/* Category */}
        <th>{category.name}</th>
        {/* Stat */}
        <td>
            <div>
                <ShowNumber value={baseTimeCost}/> s {"->"}
                <ShowNumber value={baseTimeCost / (1 + buffData[NormalBuffType.ActionSpeed])}/> s
            </div>
            <div>
                <div><ShowNumber value={times / hour}/> times/h</div>
            </div>
        </td>
        {/* Profit */}
        <td>
            <div>
                <ShowNumber value={income - cost}/>
            </div>
            {hour !== 1 ? <div>
                <ShowNumber value={(income - cost) / hour}/>{"/h"}
            </div> : <></>}
        </td>
        {/* Input */}
        <td><BuyItemTable items={inputs}/></td>
        {/* Output */}
        <td><ShowDropIncome times={times}
                            mode={mode}
                            lucky={lucky}
                            outputItems={actionDetails.outputItems}
                            dropTable={actionDetails.dropTable}
                            essenceDropTable={actionDetails.essenceDropTable}
                            rareDropTable={actionDetails.rareDropTable}
                            buffData={buffData}
                            onIncomeChange={setIncome}/></td>
        {/* Buff */}
        <td><Expandable><BuffTable/></Expandable></td>
    </>
}
