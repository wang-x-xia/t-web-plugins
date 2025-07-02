import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";
import {type AnyActionType, CollectActionType, ManufacturingActionType} from "../engine/action";
import {NormalBuffType} from "../engine/buff-type";
import {getClientData} from "../engine/client";
import {InitClientSubject} from "../engine/engine-event";
import {useBuffData} from "./buff";
import {Expandable} from "./expandable";
import {BuyItemTable, type ItemInput, prepareBuyItems, prepareSellItems, SellItemTable} from "./item-table";
import {ShowNumber} from "./number";


interface ProfitContextData {
    updateProfit(action: string, profit: number): void;
}

const NoOpProfitContextData: ProfitContextData = {
    updateProfit: () => {
    }
}

const ProfitContext = createContext<ProfitContextData>(NoOpProfitContextData);

export function ShowCollectOrManufacturingActions({actionType}: {
    actionType: CollectActionType | ManufacturingActionType
}) {
    const [actions, setActions] = useState([] as { action: string, profit: number }[]);
    useEffect(() => {
        const subscription = InitClientSubject.subscribe(data => {
            const actions = Object.values(data.actionDetailMap)
                .filter(action => action.type === actionType)
                .map(action => {
                    return {action: action.hrid, profit: 0,}
                })
            setActions(actions);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [actionType]);
    const profitState: ProfitContextData = {
        updateProfit: (action: string, profit: number) => {
            setActions(prev => {
                const prevItem = prev.find(it => it.action === action);
                if (!prevItem || prevItem.profit === profit) {
                    // Not found or no change, return prev
                    return prev;
                }
                return prev
                    .map(it => it.action === action ? {...it, profit} : it)
                    // profit desc and action asc
                    .sort((a, b) => b.profit - a.profit || a.action.localeCompare(b.action));
            });
        }
    }

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
        <ProfitContext.Provider value={profitState}>
            {actions.map(action =>
                <tr key={action.action}>
                    <ShowCollectOrManufacturingAction action={action.action}/>
                </tr>
            )}
        </ProfitContext.Provider>
        </tbody>
    </table>
}

export function ShowCollectOrManufacturingAction({action}: { action: string }) {
    const {updateProfit} = useContext(ProfitContext);

    const actionDetails = getClientData().actionDetailMap[action]
    const baseTimeCost = actionDetails.baseTimeCost / 1e9
    const category = getClientData().actionCategoryDetailMap[actionDetails.category];

    const {
        buffData,
        BuffTable
    } = useBuffData(actionDetails.type as AnyActionType, actionDetails.levelRequirement.level);

    const times = 60 * 60 / baseTimeCost * (1 + buffData[NormalBuffType.Efficiency]);

    const inputs: ItemInput[] = (actionDetails.inputItems ?? []).map(input => ({
        hrid: input.itemHrid,
        count: input.count * times,
    }));

    const {total: cost} = prepareBuyItems(inputs);

    const outputs: ItemInput[] = [
        ...(actionDetails.outputItems ?? []).map(input => ({
            hrid: input.itemHrid,
            count: input.count * times,
        })),
        ...(["dropTable", "essenceDropTable", "rareDropTable"] as ("dropTable" | "essenceDropTable" | "rareDropTable")[])
            .flatMap((dropType) => (actionDetails[dropType] ?? [])
                .map(drop => {
                    let count = times * (drop.minCount + drop.maxCount) * drop.dropRate;
                    switch (dropType) {
                        case "dropTable":
                            count *= (1 + buffData[NormalBuffType.Gathering]);
                            break;
                        case "essenceDropTable":
                            count *= (1 + buffData[NormalBuffType.EssenceFind]);
                            break;
                        case "rareDropTable":
                            count *= (1 + buffData[NormalBuffType.RareFind]);
                            break;
                    }
                    return ({
                        hrid: drop.itemHrid,
                        count,
                    });
                })),
    ];

    const {total: income} = prepareSellItems(outputs);

    useEffect(() => {
        updateProfit(action, income - cost);
    }, [income, cost]);

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
                <div><ShowNumber value={times}/> times/h</div>
            </div>
        </td>
        {/* Profit */}
        <td>
            <ShowNumber value={income - cost}/>
        </td>
        {/* Input */}
        <td><BuyItemTable items={inputs}/></td>
        {/* Output */}
        <td><SellItemTable items={outputs}/></td>
        {/* Buff */}
        <td><Expandable><BuffTable/></Expandable></td>
    </>
}
