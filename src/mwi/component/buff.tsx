import * as React from "react";
import {createContext, type FunctionComponent, useContext, useEffect, useMemo, useState} from "react";
import {map, of} from "rxjs";
import {sum} from "../../shared/list";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {type AnyActionType, CombatActionType, EnhancingActionType} from "../engine/action";
import {getBuffTypeName, getBuffValueOfEquipment, getBuffValueOfTea} from "../engine/buff";
import {type AnyBuffType, BuffSource, EnhancingBuffType, NormalBuffType} from "../engine/buff-type";
import {InitCharacterSubject} from "../engine/engine-event";
import {Equipments$} from "../engine/equipment";
import {getSkillHrid} from "../engine/hrid";
import {ShowItem} from "./item";
import {ShowPercent} from "./number";
import {Rows, RowsGroup, WithGroupCell} from "./table-utils";

export interface BuffContextData {
    update(buffType: AnyBuffType, value: number): void
}

export const NoOpBuffContextData: BuffContextData = {
    update: () => {
    }
}

const BuffContext = createContext<BuffContextData>(NoOpBuffContextData);

const LevelRequirementContext = createContext(-1)

export function useBuffData(actionType: AnyActionType, levelRequirement: number): {
    buffData: Record<AnyBuffType, number>,
    BuffTable: FunctionComponent
} {
    const [buffData, setBuffData] = useState<Record<AnyBuffType, number>>({
        [NormalBuffType.ActionSpeed]: 0,
        [NormalBuffType.Efficiency]: 0,
        [NormalBuffType.Gathering]: 0,
        [NormalBuffType.Wisdom]: 0,
        [NormalBuffType.RareFind]: 0,
        [NormalBuffType.EssenceFind]: 0,
        [EnhancingBuffType.EnhancingSuccess]: 0,
    })

    const contextData: BuffContextData = useMemo(() => {
        return {
            update: (buffType: AnyBuffType, value: number) => {
                setBuffData(prev => {
                    if (prev[buffType] === value) {
                        return prev;
                    }
                    return ({...prev, [buffType]: value});
                })
            }
        }
    }, [])

    const BuffTable = useMemo(() => {
        return () => {
            return <BuffContext.Provider value={contextData}>
                <LevelRequirementContext.Provider value={levelRequirement}>
                    <ShowBuffByActionType actionType={actionType}/>
                </LevelRequirementContext.Provider>
            </BuffContext.Provider>
        }
    }, [actionType, contextData, levelRequirement])
    return {
        buffData,
        BuffTable,
    }
}

export function ShowBuffByActionType({actionType}: { actionType: AnyActionType, }) {
    if (actionType === CombatActionType.Combat) {
        return <>Combat is not supported</>
    }

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
            <ShowBuffByBuffType key={buffType} actionType={actionType} buffType={buffType}/>)}
        </tbody>
    </table>
}

interface BuffSourceContextData {
    update(source: BuffSource, value: number): void;
}

const BuffSourceContext = createContext<BuffSourceContextData>({
    update: () => {
    }
});


export function ShowBuffByBuffType({actionType, buffType}: { actionType: AnyActionType, buffType: AnyBuffType }) {
    const buffContext = useContext(BuffContext);
    const [value, setValue] = useState<Record<BuffSource, number>>({
        [BuffSource.Equipment]: 0,
        [BuffSource.MooPass]: 0,
        [BuffSource.Community]: 0,
        [BuffSource.House]: 0,
        [BuffSource.Room]: 0,
        [BuffSource.Tea]: 0,
        [BuffSource.Level]: 0,
    });

    const currentContext: BuffSourceContextData = {
        update: (source: BuffSource, value: number) => {
            setValue(prev => ({...prev, [source]: value}));
        }
    }

    const total = sum(Object.values(value));

    useEffect(() => {
        buffContext.update(buffType, total);
    }, [total, buffContext, buffType]);

    const buffSources = [
        BuffSource.Equipment,
        BuffSource.MooPass, BuffSource.Community,
        BuffSource.House, BuffSource.Room,
        BuffSource.Tea,
        BuffSource.Level,
    ];

    return <RowsGroup
        groupCell={rows => <>
            <th rowSpan={rows}>{getBuffTypeName(buffType)}</th>
            <th rowSpan={rows}><ShowPercent value={total}/></th>
        </>}
        defaultRow={
            <tr>
                <th>{getBuffTypeName(buffType)}</th>
                <th><ShowPercent value={total}/></th>
                <td colSpan={4}></td>
            </tr>
        }>
        <BuffSourceContext.Provider value={currentContext}>
            {buffSources.map((buffSource, index) =>
                <Rows key={buffSource} index={index}>
                    <ShowBuffByBuffSource actionType={actionType} buffType={buffType}
                                          buffSource={buffSource}/>
                </Rows>)}
        </BuffSourceContext.Provider>
    </RowsGroup>

}

export function ShowBuffByBuffSource({actionType, buffType, buffSource}: {
    actionType: AnyActionType,
    buffType: AnyBuffType,
    buffSource: BuffSource
}) {
    switch (buffSource) {
        case BuffSource.Equipment:
            return <ShowBuffByBuffSourceEquipment actionType={actionType} buffType={buffType}/>;
        case BuffSource.MooPass:
            return <ShowBuffByBuffSourceSimple actionType={actionType} buffType={buffType}
                                               buffSource={buffSource} buffName="Moo Pass"
                                               buffMapKey="mooPassActionTypeBuffsMap"/>;
        case BuffSource.Community:
            return <ShowBuffByBuffSourceSimple actionType={actionType} buffType={buffType}
                                               buffSource={buffSource} buffName="Community"
                                               buffMapKey="communityActionTypeBuffsMap"/>;
        case BuffSource.House:
            return <ShowBuffByBuffSourceHouse actionType={actionType} buffType={buffType}/>;
        case BuffSource.Room:
            return <ShowBuffByBuffSourceRoom actionType={actionType} buffType={buffType}/>;
        case BuffSource.Tea:
            return <ShowBuffByBuffSourceTea actionType={actionType} buffType={buffType}/>;
        case BuffSource.Level:
            return <ShowBuffByBuffSourceLevel actionType={actionType} buffType={buffType}/>;
    }
}

export function ShowBuffByBuffSourceEquipment({actionType, buffType}: {
    actionType: AnyActionType,
    buffType: AnyBuffType
}) {
    const parentContext = useContext(BuffSourceContext);

    const equipments$ = useMemo(() => Equipments$.pipe(
        map(equipment => Object.values(equipment)
            .map(equipment => ({
                equipment,
                value: getBuffValueOfEquipment(actionType, buffType, equipment.itemHrid, equipment.enhancementLevel)
            }))
            .filter(it => it.value > 0))), [actionType, buffType]);

    const equipments = useLatestOrDefault(equipments$, []);

    const total = sum(equipments.map(it => it.value));

    useEffect(() => {
        parentContext.update(BuffSource.Equipment, total);
    }, [total]);

    return <RowsGroup
        groupCell={rows => <>
            <th rowSpan={rows}>Equipment</th>
            <th rowSpan={rows}><ShowPercent value={total}/></th>
        </>}
        defaultRow={<></>}>
        {equipments.map((equipment, index) =>
            <tr key={equipment.equipment.location}>
                <WithGroupCell index={index}>
                    <th>
                        <ShowItem hrid={equipment.equipment.itemHrid}
                                  enhancementLevel={equipment.equipment.enhancementLevel}/>
                    </th>
                    <td><ShowPercent value={equipment.value}/></td>
                </WithGroupCell>
            </tr>)}
    </RowsGroup>
}


export function ShowBuffByBuffSourceSimple({actionType, buffType, buffSource, buffName, buffMapKey}: {
    actionType: AnyActionType,
    buffType: AnyBuffType
    buffSource: BuffSource.MooPass | BuffSource.Community | BuffSource.House | BuffSource.Room,
    buffName: string,
    buffMapKey: "mooPassActionTypeBuffsMap" | "communityActionTypeBuffsMap" | "houseActionTypeBuffsMap",
}) {
    const parentContext = useContext(BuffSourceContext);
    const buffValue$ = useMemo(() => InitCharacterSubject.pipe(map(it => {
        const buffs = (it[buffMapKey][actionType] ?? []).filter(it => it.typeHrid === buffType)
            .map(it => it.flatBoost);
        return sum(buffs);
    })), [actionType, buffType, buffMapKey]);
    const value = useLatestOrDefault(buffValue$, 0);

    useEffect(() => {
        parentContext.update(buffSource, value);
    }, [value]);

    if (value === 0) {
        return <></>
    }

    return <tr>
        <WithGroupCell index={0}>
            <th>{buffName}</th>
            <td><ShowPercent value={value}/></td>
            <td colSpan={2}></td>
        </WithGroupCell>
    </tr>
}

export function ShowBuffByBuffSourceHouse({actionType, buffType}: {
    actionType: AnyActionType,
    buffType: AnyBuffType
}) {
    if (buffType === NormalBuffType.RareFind || buffType === NormalBuffType.Wisdom) {
        return <ShowBuffByBuffSourceSimple actionType={actionType} buffType={buffType}
                                           buffSource={BuffSource.House} buffName="House"
                                           buffMapKey="houseActionTypeBuffsMap"/>
    } else {
        return <></>
    }
}

export function ShowBuffByBuffSourceRoom({actionType, buffType}: {
    actionType: AnyActionType,
    buffType: AnyBuffType
}) {
    if (buffType === NormalBuffType.RareFind || buffType === NormalBuffType.Wisdom) {
        return <></>
    } else {
        return <ShowBuffByBuffSourceSimple actionType={actionType} buffType={buffType}
                                           buffSource={BuffSource.Room} buffName="Room"
                                           buffMapKey="houseActionTypeBuffsMap"/>
    }
}

export function ShowBuffByBuffSourceTea({actionType, buffType}: {
    actionType: AnyActionType,
    buffType: AnyBuffType
}) {
    const parentContext = useContext(BuffSourceContext);
    const slots$ = useMemo(() => InitCharacterSubject.pipe(map((character) => {
        return character.actionTypeDrinkSlotsMap[actionType].flatMap((slot, index) => {
            if (slot === null) {
                return [];
            }
            const buffValue = getBuffValueOfTea(actionType, buffType, slot.itemHrid)
            if (!buffValue) {
                return []
            }
            return [{
                slot: index,
                tea: slot.itemHrid,
                value: buffValue,
            }]
        })
    })), [actionType, buffType]);
    const slots = useLatestOrDefault(slots$, []);

    const total = sum(slots.map(it => it.value));

    useEffect(() => {
        parentContext.update(BuffSource.Tea, total);
    }, [total]);


    return <RowsGroup
        groupCell={rows => <>
            <th rowSpan={rows}>Tea</th>
            <th rowSpan={rows}><ShowPercent value={total}/></th>
        </>}
        defaultRow={<></>}>
        {slots.map((slot, index) =>
            <tr key={slot.tea}>
                <WithGroupCell index={index}>
                    <th>
                        <ShowItem hrid={slot.tea}/>({slot.slot}/3)
                    </th>
                    <td><ShowPercent value={slot.value}/></td>
                </WithGroupCell>
            </tr>)}
    </RowsGroup>
}


export function ShowBuffByBuffSourceLevel({actionType, buffType}: {
    actionType: AnyActionType,
    buffType: AnyBuffType
}) {
    const parentContext = useContext(BuffSourceContext);
    const levelRequirement = useContext(LevelRequirementContext);

    const buff$ = useMemo(() => {
        if (buffType == NormalBuffType.Efficiency && levelRequirement > 0) {
            return InitCharacterSubject.pipe(
                map(character => {
                    const level = character.characterSkills.find(it => it.skillHrid === getSkillHrid(actionType))?.level ?? 0;
                    return {
                        level,
                        value: Math.max(0, (level - levelRequirement) * 0.01)
                    };
                })
            )
        }
        return of({level: 0, value: 0})
    }, [buffType, levelRequirement, actionType])

    const {level, value} = useLatestOrDefault(buff$, {level: 0, value: 0});
    useEffect(() => {
        parentContext.update(BuffSource.Level, value);
    }, [value]);

    if (value === 0) {
        return <></>
    }

    return <tr>
        <WithGroupCell index={0}>
            <th>Level</th>
            <td><ShowPercent value={value}/></td>
            <td colSpan={2}>
                {level}(level) - {levelRequirement}(requirement)
            </td>
        </WithGroupCell>
    </tr>
}