import * as React from "react";
import {ShowNumber, ShowPercent} from "./component/number";
import {type CollectAction, CollectActionType} from "./engine/action";
import {
    type Buff,
    CollectBuffType,
    getBuffTypeName,
    getEfficiencyAfterBuff,
    getGatheringAfterBuff,
    getRareFindAfterBuff,
    getSumOfBuff,
    getTimeCostAfterBuff
} from "./engine/buff";
import {currentCharacter} from "./engine/character";
import {getBuffSourceName, getCollectActions} from "./engine/client";
import {DropType} from "./engine/drop";
import {getItemName} from "./engine/item";
import {getSellPriceByHrid} from "./engine/market";
import {LifecycleEvent, registerLifecycle} from "./lifecycle";
import {AddView} from "./view";

export function foragingPlugin() {
    registerLifecycle("foraging-plugin", [LifecycleEvent.CharacterLoaded], () => {
        AddView("foraging", <ShowForaging/>)
    })
}

export interface ActionRow {
    action: CollectAction
    totalIncome: number
    dropItemRows: DropItemRow[]
}


export function ShowForaging() {
    const [expandDropTable, setExpandDropTable] = React.useState(false);

    const character = currentCharacter();
    const buffs = character.buffs.filter(b => b.action === CollectActionType.Foraging);
    const actionRows: ActionRow[] = getCollectActions(CollectActionType.Foraging)
        .map(action => {
            const dropItemRows = action.dropTable.map((item) => {
                let count = item.dropRate
                    * (3600 / getTimeCostAfterBuff(action))
                    * (item.maxCount + item.minCount) / 2
                    * getEfficiencyAfterBuff(action);
                switch (item.type) {
                    case DropType.Common:
                        count = count * getGatheringAfterBuff(action);
                        break;
                    case DropType.Essence:
                        break;
                    case DropType.Rare:
                        count = count * getRareFindAfterBuff(action);
                        break;
                }
                const price = getSellPriceByHrid(item.itemHrid);
                const income = count * price;
                return {
                    name: getItemName(item.itemHrid),
                    count: count,
                    price: price,
                    percent: 0,
                    income: income,
                }
            })
            const totalIncome = dropItemRows.reduce((acc, row) => acc + row.income, 0);
            dropItemRows.forEach((row) => row.percent = row.income / totalIncome);

            return {
                action: action,
                totalIncome,
                dropItemRows,
            }
        })
        .sort((a, b) => b.totalIncome - a.totalIncome);


    return <div>
        <div>Foraging</div>
        <table>
            <thead>
            <tr>
                <th>Buff Type</th>
                <th>Value</th>
                <th>Source</th>
            </tr>
            </thead>
            <tbody>
            {Object.values(CollectBuffType).map((buffType) =>
                <tr key={buffType}>
                    <ShowBuffValue key={buffType} buffType={buffType} buffs={buffs}/>
                </tr>)
            }
            </tbody>
        </table>


        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Income/h</th>
                <th>Rate</th>
                <th>Drop Table
                    <button onClick={() => setExpandDropTable(!expandDropTable)}>
                        {expandDropTable ? "-" : "+"}
                    </button>
                </th>
            </tr>
            </thead>
            <tbody>
            {actionRows.map(({action, totalIncome, dropItemRows}) => <tr key={action.hrid}>
                <td>{action.name}</td>
                <td>{action.category.name}</td>
                <td><ShowNumber value={totalIncome}/></td>
                <td>
                    <div>
                        <ShowNumber value={action.baseTimeCost}/> s {"->"}
                        <ShowNumber value={getTimeCostAfterBuff(action)}/> s
                    </div>
                    <div><ShowNumber value={(3600 / getTimeCostAfterBuff(action))}/> times/h</div>
                    <div>Efficiency: <ShowNumber value={getEfficiencyAfterBuff(action)}/> ×</div>
                </td>
                <td><ShowDropTable rows={dropItemRows} expand={expandDropTable}/></td>
            </tr>)}
            </tbody>
        </table>
    </div>
}

interface DropItemRow {
    name: string,
    count: number,
    price: number,
    income: number,
    percent: number,
}

export function ShowDropTable({rows, expand: allExpand}: { rows: DropItemRow[], expand: boolean }) {
    const [expand, setExpand] = React.useState(allExpand);

    if (!expand && !allExpand) {
        return <button onClick={() => setExpand(true)}>+</button>
    }

    return <>
        {!allExpand && <button onClick={() => setExpand(!expand)}>-</button>}
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Count/h</th>
                <th>Price</th>
                <th>Income/h</th>
                <th>Radio</th>
            </tr>
            </thead>
            <tbody>
            {rows.map((row) => <tr key={row.name}>
                <td>{row.name}</td>
                <td><ShowNumber value={row.count}/></td>
                <td><ShowNumber value={row.price}/></td>
                <td><ShowNumber value={row.income}/></td>
                <td><ShowPercent value={row.percent}/></td>
            </tr>)}
            </tbody>
        </table>
    </>
}

export function ShowBuffValue({buffType, buffs}: { buffType: CollectBuffType, buffs: Buff[] }) {
    const typeBuff = buffs.filter(b => b.type === buffType);
    const value = getSumOfBuff(buffs, buffType);

    return <>
        <th>{getBuffTypeName(buffType)}</th>
        <td><ShowPercent value={value}/></td>
        <td>
            <table>
                <thead>
                <tr>
                    <th>Source</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                {typeBuff.map(b =>
                    <tr key={b.source}>
                        <th>{getBuffSourceName(b.source)}</th>
                        <td><ShowPercent value={b.flatBoost}/></td>
                    </tr>)}
                </tbody>
            </table>
        </td>
    </>
}