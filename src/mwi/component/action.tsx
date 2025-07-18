import * as React from "react";
import {useMemo} from "react";
import {useLatestValue} from "../../shared/rxjs-react";
import {CollectActionType, ManufacturingActionType} from "../engine/action";
import {BuffData$, produceLevelData} from "../engine/buff";
import {getClientData} from "../engine/client";
import {InitCharacterData$} from "../engine/engine-event";
import {
    DropType,
    getActionProfit,
    type ItemDropIncome,
    type ItemDropInfo,
    type ItemInputCost,
    type ProfitConfiguration,
    type ProfitData
} from "../engine/profit";
import {ShowBuffByNonCombatActionType} from "./buff";
import {Expandable} from "./expandable";
import {ShowItem} from "./item";
import {ShowNumber, ShowPercent} from "./number";


export function ShowCollectOrManufacturingActions({actionType, hours, mode, lucky}: {
    actionType: CollectActionType | ManufacturingActionType,
    hours: number,
    mode: "avg" | "lucky",
    lucky: number,
}) {
    const buffData = useLatestValue(BuffData$);
    const characterData = useLatestValue(InitCharacterData$);
    const actions = useMemo<(ProfitData & ProfitConfiguration) []>(() => {
        if (!buffData || !characterData) {
            return [];
        }
        const actions = Object.values(getClientData().actionDetailMap)
            .filter(action => action.type === actionType)
            .map(action => {
                const config: ProfitConfiguration = {
                    action: action.hrid,
                    hours, mode, lucky,
                    buff: produceLevelData(buffData[actionType], action.levelRequirement.level,
                        characterData.characterSkills.find(it => it.skillHrid === action.levelRequirement.skillHrid)?.level ?? 0),
                }
                return {
                    ...getActionProfit(config),
                    ...config,
                }
            })
        return actions.sort((a, b) => {
            return b.profit - a.profit
        });
    }, [actionType, buffData, characterData, hours, mode, lucky]);
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
        {actions.map(action =>
            <tr key={action.action}>
                <ShowCollectOrManufacturingAction data={action}/>
            </tr>
        )}
        </tbody>
    </table>
}

export function ShowCollectOrManufacturingAction({data}: { data: ProfitData & ProfitConfiguration }) {
    const {action, baseTimeCost, timeCost, times, cost, income, profit, inputs, outputs, buff, hours} = data;
    const actionDetails = getClientData().actionDetailMap[action];
    const actionCategory = getClientData().actionCategoryDetailMap[actionDetails.category];

    return <>
        {/* Name */}
        <th>{actionDetails.name}</th>
        {/* Category */}
        <th>{actionCategory.name}</th>
        {/* Stat */}
        <td>
            <div>
                <ShowNumber value={baseTimeCost}/> s {"->"}
                <ShowNumber value={timeCost}/> s
            </div>
            <div>
                <div><ShowNumber value={times}/> times</div>
                {hours !== 1
                    ? <div><ShowNumber value={times / hours}/> times/h</div>
                    : <></>
                }
            </div>
        </td>
        {/* Profit */}
        <td>
            <ShowNumber value={profit}/>
            {hours !== 1
                ? <div><ShowNumber value={profit / hours}/> /h</div>
                : <></>
            }
        </td>
        {/* Input */}
        <td>
            <ShowNumber value={cost}/>
            <ShowItemInputCost inputs={inputs} cost={cost}/>
        </td>
        {/* Output */}
        <td>
            <ShowNumber value={income}/>
            <ShowItemDropIncome outputs={outputs} income={income}/>
        </td>
        {/* Buff */}
        <td><Expandable><ShowBuffByNonCombatActionType actionType={actionDetails.type as any}
                                                       data={buff}/></Expandable></td>
    </>
}

export function ShowItemInputCost({inputs, cost: totalCost}: { inputs: ItemInputCost[], cost: number }) {
    if (inputs.length === 0) {
        return null;
    }
    return <Expandable>
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Count</th>
                <th>Price</th>
                <th>Subtotal</th>
                <th>Radio</th>
            </tr>
            </thead>
            <tbody>
            {
                inputs.map(({hrid, count, price, cost}) => <tr key={hrid}>
                    <td><ShowItem hrid={hrid}/></td>
                    <td><ShowNumber value={count}/></td>
                    <td><ShowNumber value={price}/></td>
                    <td><ShowNumber value={cost}/></td>
                    <td><ShowPercent value={cost / totalCost}/></td>
                </tr>)
            }
            </tbody>
        </table>
    </Expandable>
}

export function ShowItemDropIncome({outputs, income: totalIncome}: { outputs: ItemDropIncome[], income: number }) {
    if (outputs.length === 0) {
        return <></>
    }
    return <Expandable>
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Info</th>
                <th>Count</th>
                <th>Price</th>
                <th>Subtotal</th>
                <th>Radio</th>
            </tr>
            </thead>
            <tbody>
            {outputs.map((output) =>
                <ShowDropIncome key={`${output.type}-${output.hrid}-${output.originDrop.rate}`} output={output}
                                totalIncome={totalIncome}/>)
            }
            </tbody>
        </table>
    </Expandable>
}

function ShowDropIncome({output, totalIncome}: { output: ItemDropIncome, totalIncome: number }) {
    if (output.type === DropType.RareLoot) {
        const {hrid, count, income, outputs} = output;
        return <>
            <tr>
                <th><ShowItem hrid={hrid}/></th>
                <td><ShowDropInfo output={output}/></td>
                <td><ShowNumber value={count}/></td>
                <td><ShowNumber value={income / count}/></td>
                <td><ShowNumber value={income}/></td>
                <td><ShowPercent value={income / totalIncome}/></td>
            </tr>
            {outputs.map(({
                              hrid: childHrid,
                              count: childCount,
                              price: childPrice,
                              income: childIncome,
                              drop: childDrop
                          }) => <tr key={`${childHrid}-${childDrop.rate}`}>
                <td>| <ShowItem hrid={childHrid}/></td>
                <td><ShowChildDropInfo drop={childDrop}/></td>
                <td><ShowNumber value={childCount}/></td>
                <td><ShowNumber value={childPrice}/></td>
                <td><ShowNumber value={childIncome}/></td>
                <td><ShowPercent value={childIncome / totalIncome}/></td>
            </tr>)
            }
        </>;
    } else {
        const {hrid, count, price, income, enhancementLevel} = output
        return <tr>
            <td><ShowItem hrid={hrid} enhancementLevel={enhancementLevel}/></td>
            <td><ShowDropInfo output={output}/></td>
            <td><ShowNumber value={count}/></td>
            <td><ShowNumber value={price}/></td>
            <td><ShowNumber value={income}/></td>
            <td><ShowPercent value={income / totalIncome}/></td>
        </tr>;
    }
}


function ShowDropInfo({output}: { output: ItemDropIncome }) {
    const {type, originDrop, buffedDrop} = output
    const dropInfo = <Expandable>
        <div>{
            originDrop.minCount === originDrop.maxCount ?
                <><ShowNumber value={buffedDrop.minCount}/>(<ShowNumber value={originDrop.minCount}/>)</> :
                <><ShowNumber value={buffedDrop.minCount}/>(<ShowNumber value={originDrop.minCount}/>) -
                    <ShowNumber value={buffedDrop.maxCount}/>(<ShowNumber value={originDrop.maxCount}/>)</>

        }</div>
        <div><ShowPercent value={buffedDrop.rate}/>(<ShowPercent value={originDrop.rate}/>)</div>
    </Expandable>

    switch (type) {
        case DropType.Output:
            return <>Output</>
        case DropType.Normal:
            return <>Output{dropInfo}</>
        case DropType.Essence:
            return <>Essence{dropInfo}</>
        case DropType.Rare:
        case DropType.RareLoot:
            return <>Rare{dropInfo}</>
    }
}

function ShowChildDropInfo({drop}: { drop: ItemDropInfo }) {
    return <>Open{<Expandable>
        <div>{
            drop.minCount === drop.maxCount ?
                <><ShowNumber value={drop.minCount}/></> :
                <><ShowNumber value={drop.minCount}/> - <ShowNumber value={drop.maxCount}/></>
        }</div>
        <div><ShowPercent value={drop.rate}/></div>
    </Expandable>}</>
}
