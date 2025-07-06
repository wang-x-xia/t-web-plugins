import * as React from "react";
import {type ReactNode, useMemo} from "react";
import {combineLatest, map, of} from "rxjs";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {type AnyActionType, CombatActionType, EnhancingActionType} from "../engine/action";
import {BuffData$, createEmptyBuffData, getBuffTypeName, produceLevelData} from "../engine/buff";
import {
    type AnyBuffType,
    type BuffData,
    BuffSource,
    type BuffTypeData,
    EnhancingBuffType,
    NormalBuffType
} from "../engine/buff-type";
import {InitCharacterData$} from "../engine/engine-event";
import {getSkillHrid} from "../engine/hrid";
import {ShowItem} from "./item";
import {ShowPercent} from "./number";


export function useBuffData(actionType: Exclude<AnyActionType, CombatActionType>, levelRequirement: number): BuffData {
    const buffData$ = useMemo(() => combineLatest({buff: BuffData$, character: InitCharacterData$}).pipe(
        map(({buff, character}) => {
            const level = character.characterSkills.find(it => it.skillHrid === getSkillHrid(actionType))?.level ?? 0;
            return produceLevelData(buff[actionType], levelRequirement, level);
        })), [actionType, levelRequirement]);

    return useLatestOrDefault(buffData$, createEmptyBuffData());
}

export function ShowBuffByNonCombatActionType({actionType, data: inputData}: {
    actionType: Exclude<AnyActionType, CombatActionType>,
    data?: BuffData
}) {
    const data$ = useMemo(() => {
        if (inputData !== undefined) {
            return of(inputData);
        } else {
            return BuffData$.pipe(map(it => it[actionType]));
        }
    }, [inputData, actionType]);
    const data = useLatestOrDefault(data$, createEmptyBuffData());

    const buffTypes: AnyBuffType[] = (actionType === EnhancingActionType.Enhancing) ?
        [NormalBuffType.ActionSpeed, EnhancingBuffType.EnhancingSuccess, NormalBuffType.Gathering, NormalBuffType.Wisdom, NormalBuffType.RareFind, NormalBuffType.EssenceFind] :
        [NormalBuffType.ActionSpeed, NormalBuffType.Efficiency, NormalBuffType.Gathering, NormalBuffType.Wisdom, NormalBuffType.RareFind, NormalBuffType.EssenceFind];

    return <table>
        <thead>
        <tr>
            <th colSpan={2}>Buff Type</th>
            <th colSpan={2}>Source</th>
            <th colSpan={2}>Info</th>
        </tr>
        </thead>
        <tbody>
        {buffTypes.map((buffType) =>
            <ShowBuffByBuffType key={buffType} buffType={buffType} data={data[buffType]}/>)}
        </tbody>
    </table>
}


export function ShowBuffByBuffType({buffType, data}: {
    buffType: AnyBuffType,
    data: BuffTypeData,
}) {
    if (data.value === 0) {
        return <></>
    }

    const rows = data[BuffSource.Equipment].equipments.length +
        (data[BuffSource.MooPass].value ? 1 : 0) +
        (data[BuffSource.Community].value ? 1 : 0) +
        (data[BuffSource.House].value ? 1 : 0) +
        (data[BuffSource.Room].value ? 1 : 0) +
        data[BuffSource.Tea].slots.length +
        (data[BuffSource.Level].value ? 1 : 0);

    const firstType = data[BuffSource.Equipment].value > 0 ? BuffSource.Equipment :
        data[BuffSource.MooPass].value ? BuffSource.MooPass :
            data[BuffSource.Community].value ? BuffSource.Community :
                data[BuffSource.House].value ? BuffSource.House :
                    data[BuffSource.Room].value ? BuffSource.Room :
                        data[BuffSource.Tea].value > 0 ? BuffSource.Tea :
                            data[BuffSource.Level].value > 0 ? BuffSource.Level : BuffSource.Level;

    const headerColumns = <>
        <th rowSpan={rows}>{getBuffTypeName(buffType)}</th>
        <th rowSpan={rows}><ShowPercent value={data.value}/></th>
    </>
    return <>
        <ShowBuffByBuffSourceEquipment data={data[BuffSource.Equipment]}>
            {firstType == BuffSource.Equipment ? headerColumns : <></>}
        </ShowBuffByBuffSourceEquipment>
        <ShowBuffByBuffSourceSimple value={data[BuffSource.MooPass].value} buffName="Moo pass">
            {firstType == BuffSource.MooPass ? headerColumns : <></>}
        </ShowBuffByBuffSourceSimple>
        <ShowBuffByBuffSourceSimple value={data[BuffSource.Community].value} buffName="Community">
            {firstType == BuffSource.Community ? headerColumns : <></>}
        </ShowBuffByBuffSourceSimple>
        <ShowBuffByBuffSourceSimple value={data[BuffSource.House].value} buffName="House">
            {firstType == BuffSource.House ? headerColumns : <></>}
        </ShowBuffByBuffSourceSimple>
        <ShowBuffByBuffSourceSimple value={data[BuffSource.Room].value} buffName="Room">
            {firstType == BuffSource.Room ? headerColumns : <></>}
        </ShowBuffByBuffSourceSimple>
        <ShowBuffByBuffSourceTea data={data[BuffSource.Tea]}>
            {firstType == BuffSource.Tea ? headerColumns : <></>}
        </ShowBuffByBuffSourceTea>
        <ShowBuffByBuffSourceLevel data={data[BuffSource.Level]}>
            {firstType == BuffSource.Level ? headerColumns : <></>}
        </ShowBuffByBuffSourceLevel>
    </>
}


export function ShowBuffByBuffSourceEquipment({data, children}: {
    data: BuffTypeData[BuffSource.Equipment],
    children: ReactNode,
}) {
    if (data.value === 0) {
        return <></>
    }
    return <>
        <tr>
            {children}
            <th rowSpan={data.equipments.length}>Equipment</th>
            <th rowSpan={data.equipments.length}><ShowPercent value={data.value}/></th>
            <td><ShowItem hrid={data.equipments[0].equipment.itemHrid}
                          enhancementLevel={data.equipments[0].equipment.enhancementLevel}/></td>
            <td><ShowPercent value={data.equipments[0].value}/></td>
        </tr>
        {
            data.equipments.slice(1).map(({value, equipment}) =>
                <tr key={equipment.location}>
                    <td><ShowItem hrid={equipment.itemHrid}
                                  enhancementLevel={equipment.enhancementLevel}/></td>
                    <td><ShowPercent value={value}/></td>
                </tr>
            )
        }
    </>
}


export function ShowBuffByBuffSourceSimple({value, buffName, children}: {
    value: number,
    buffName: string,
    children: ReactNode
}) {
    if (value === 0) {
        return <></>
    }
    return <tr>
        {children}
        <th>{buffName}</th>
        <th><ShowPercent value={value}/></th>
        <td colSpan={2}></td>
    </tr>
}

export function ShowBuffByBuffSourceTea({data, children}: {
    data: BuffTypeData[BuffSource.Tea],
    children: ReactNode,
}) {
    if (data.value === 0) {
        return <></>
    }

    return <>
        <tr>
            {children}
            <th rowSpan={data.slots.length}>Tea</th>
            <th rowSpan={data.slots.length}><ShowPercent value={data.value}/></th>
            <td><ShowItem hrid={data.slots[0].tea}/>({data.slots[0].slot}/3)</td>
            <td><ShowPercent value={data.slots[0].value}/></td>
        </tr>
        {
            data.slots.slice(1).map(({value, tea, slot}) =>
                <tr key={tea}>
                    <td><ShowItem hrid={tea}/>({slot}/3)</td>
                    <td><ShowPercent value={value}/></td>
                </tr>)
        }
    </>
}


export function ShowBuffByBuffSourceLevel({data, children}: {
    data: BuffTypeData[BuffSource.Level],
    children: ReactNode,
}) {
    const {value, level, levelRequirement} = data
    if (value === 0) {
        return <></>
    }
    return <tr>
        {children}
        <th>Level</th>
        <td><ShowPercent value={value}/></td>
        <td colSpan={2}>
            {level}(level) - {levelRequirement}(requirement)
        </td>
    </tr>
}