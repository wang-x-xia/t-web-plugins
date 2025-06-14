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
import {type DropItem, DropType} from "./engine/drop";
import {getItemName} from "./engine/item";
import {LifecycleEvent, registerLifecycle} from "./lifecycle";
import {AddView} from "./view";

export function foragingPlugin() {
    registerLifecycle("foraging-plugin", [LifecycleEvent.CharacterLoaded], () => {
        AddView(<ShowForaging/>)
    })
}


export function ShowForaging() {
    const character = currentCharacter();
    const buffs = character.buffs.filter(b => b.action === CollectActionType.Foraging);
    const actions = getCollectActions(CollectActionType.Foraging)

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
                <th>Rate</th>
                <th>Drop Table</th>
            </tr>
            </thead>
            <tbody>
            {actions.map((action) => <tr key={action.hrid}>
                <td>{action.name}</td>
                <td>{action.category.name}</td>
                <td>
                    <p>{action.baseTimeCost.toFixed(2)} s {"->"} {getTimeCostAfterBuff(action).toFixed(2)} s</p>
                    <p>{(3600 / getTimeCostAfterBuff(action)).toFixed(2)} times/h</p>
                    <p>Efficiency: {getEfficiencyAfterBuff(action).toFixed(2)} ×</p>
                    <p>Gathering: {getGatheringAfterBuff(action).toFixed(2)} ×</p>
                    <p>Rare find: {getRareFindAfterBuff(action).toFixed(2)} ×</p>
                </td>
                <td><ShowDropTable action={action}/></td>
            </tr>)}
            </tbody>
        </table>
    </div>
}


export function ShowDropTable({action}: { action: CollectAction }) {
    return <table>
        <thead>
        <tr>
            <th>Name</th>
            <th>Count / hour</th>
        </tr>
        </thead>
        <tbody>
        {action.dropTable.map((item) =>
            <ShowDropItem key={item.itemHrid} item={item} action={action}/>)}
        </tbody>
    </table>
}

function ShowDropItem({item, action}: { item: DropItem, action: CollectAction }) {
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
    return <tr>
        <td>{getItemName(item.itemHrid)}</td>
        <td>{count.toFixed(2)}</td>
    </tr>
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