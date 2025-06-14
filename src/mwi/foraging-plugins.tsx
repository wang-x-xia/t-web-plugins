import * as React from "react";
import {type CollectAction, CollectActionType} from "./engine/action";
import {
    type Buff,
    CollectBuffType,
    getEfficiencyAfterBuff,
    getGatheringAfterBuff,
    getRareFindAfterBuff,
    getSumOfBuff,
    getTimeCostAfterBuff
} from "./engine/buff";
import {currentCharacter} from "./engine/character";
import {getCollectActions} from "./engine/client";
import {DropType} from "./engine/drop";
import {getItemName} from "./engine/item";
import {getSellPriceByHrid} from "./engine/market";
import {LifecycleEvent, registerLifecycle} from "./lifecycle";
import {AddView} from "./view";

export function foragingPlugin() {
    registerLifecycle("foraging-plugin", [LifecycleEvent.CharacterLoaded], () => {
        AddView(<ShowForaging/>)
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
        {
            Object.values(CollectBuffType).map((buffType) =>
                <ShowBuffValue key={buffType} buffType={buffType} buffs={buffs}/>)
        }
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
                <td>{totalIncome.toFixed(2)}</td>
                <td>
                    <p>{action.baseTimeCost.toFixed(2)} s {"->"} {getTimeCostAfterBuff(action).toFixed(2)} s</p>
                    <p>{(3600 / getTimeCostAfterBuff(action)).toFixed(2)} times/h</p>
                    <p>Efficiency: {getEfficiencyAfterBuff(action).toFixed(2)} ×</p>
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
                <td>{row.count.toFixed(2)}</td>
                <td>{row.price.toFixed(0)}</td>
                <td>{row.income.toFixed(2)}</td>
                <td>{(row.percent * 100).toFixed(2)}%</td>
            </tr>)}
            </tbody>
        </table>
    </>
}

export function ShowBuffValue({buffType, buffs}: { buffType: CollectBuffType, buffs: Buff[] }) {
    const typeBuff = buffs.filter(b => b.type === buffType);
    const value = getSumOfBuff(buffs, buffType);

    return <>
        <div>{buffType}: {`${(value * 100).toFixed(2)}%`}</div>
        <ul>
            {typeBuff.map(b => <li key={b.source}>{b.source}: {`${(b.flatBoost * 100).toFixed(2)}%`}</li>)}
        </ul>
    </>
}