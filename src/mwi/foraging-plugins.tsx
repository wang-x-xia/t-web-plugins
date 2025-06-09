import * as React from "react";
import {currentCharacter} from "./engine/character";
import type {EngineBuff} from "./engine/engine-type";
import {Action, BuffType} from "./hrid";
import {LifecycleEvent, registerLifecycle} from "./lifecycle";
import {AddView} from "./view";

export function foragingPlugin() {
    registerLifecycle("foraging-plugin", [LifecycleEvent.CharacterLoaded], () => {
        const character = currentCharacter();
        const buffs = character.buffs.filter(b => b.action === Action.Foraging);
        AddView(<div>
            <div>Foraging</div>
            <ShowBuffValue buffType={BuffType.Gathering} buffs={buffs}/>
            <ShowBuffValue buffType={BuffType.Efficiency} buffs={buffs}/>
            <ShowBuffValue buffType={BuffType.ActionSpeed} buffs={buffs}/>
            <ShowBuffValue buffType={BuffType.Wisdom} buffs={buffs}/>
            <ShowBuffValue buffType={BuffType.RareFind} buffs={buffs}/>
        </div>)
    })
}

export function ShowBuffValue({buffType, buffs}: { buffType: BuffType, buffs: EngineBuff[] }) {
    const typeBuff = buffs.filter(b => b.type === buffType)
    const value = typeBuff.reduce((acc, b) => acc + b.flatBoost, 0);

    return <>
        <div>{buffType}: {`${(value * 100).toFixed(2)}%`}</div>
        <ul>
            {typeBuff.map(b => <li key={b.source}>{b.source}: {`${(b.flatBoost * 100).toFixed(2)}%`}</li>)}
        </ul>
    </>
}