import {combineLatest} from "rxjs";
import {log} from "../../shared/log";
import type {NoncombatStats} from "../api/character-type";
import {AllActionType, type AnyActionType, type CollectAction} from "./action";
import {
    type AnyBuffType,
    type BasicBuff,
    type Buff,
    BuffSource,
    CollectBuffType,
    type EquipmentBuff
} from "./buff-type";
import {currentCharacter} from "./character";
import {getClientData} from "./client";

import {InitCharacterSubject} from "./engine-event";
import {equipmentStore} from "./equipment";
import {getActionTypeByTypeHrid, getBuffHrid, getBuffSourceByHrid, getBuffTypeByHrid} from "./hrid";
import {createCharacterStore} from "./store";


const store = createCharacterStore<Buff[]>("buffs");

export function buffStore() {
    return store;
}

combineLatest({data: InitCharacterSubject, equipments: equipmentStore().dataSubject}).subscribe((
    {data, equipments}) => {
    store.data = [data.mooPassActionTypeBuffsMap, data.communityActionTypeBuffsMap, data.houseActionTypeBuffsMap, data.consumableActionTypeBuffsMap, data.equipmentActionTypeBuffsMap]
        .flatMap((buffMap) => Object.entries(buffMap).flatMap(([key, value]) => (value || []).map<Buff | null>((buff) => {
            const action = getActionTypeByTypeHrid(key);
            const type = getBuffTypeByHrid(buff.typeHrid);
            const source = getBuffSourceByHrid(buff.uniqueHrid);
            if (!action || !type || !source) {
                log("invalid-buff", {"action": key, "buff": buff});
                return null;
            }
            const basic: BasicBuff = {
                action,
                type,
                source,
                value: buff.flatBoost,
            }
            if (source === BuffSource.Equipment) {
                return {
                    ...basic,
                    equipments: Object.values(equipments)
                        .filter(eq => eq.buffs.some(eqBuff =>
                            eqBuff.action === action &&
                            eqBuff.type === type))
                        .map(({location, itemHrid, enhancementLevel, buffs}) => {
                            return {
                                location, itemHrid, enhancementLevel,
                                value: buffs.find(it => it.action === action && it.type === type)?.value ?? 0,
                            }
                        })
                } as EquipmentBuff
            }
            return basic
        })))
        .filter(it => it != null)
});


export function getSumOfBuff(buffs: Buff[], buffType: AnyBuffType): number {
    const typeBuff = buffs.filter(b => b.type === buffType);
    return typeBuff.reduce((acc, b) => acc + b.value, 0)
}

export function getBuffsOfActionType(actionType: AnyActionType): Buff[] {
    return store.data.filter(b => b.action === actionType);
}

export function getTimeCostAfterBuff(action: CollectAction): number {
    return action.baseTimeCost / (1 + getSumOfBuff(getBuffsOfActionType(action.type), CollectBuffType.ActionSpeed))
}

export function getEfficiencyAfterBuff(action: CollectAction) {
    const myLevel = currentCharacter().skills[action.type]!.level
    if (myLevel < action.levelRequirement) {
        return 0
    }
    return 1 + getSumOfBuff(getBuffsOfActionType(action.type), CollectBuffType.Efficiency) +
        0.01 * (myLevel - action.levelRequirement)
}

export function getGatheringAfterBuff(action: CollectAction) {
    return 1 + getSumOfBuff(getBuffsOfActionType(action.type), CollectBuffType.Gathering)
}

export function getRareFindAfterBuff(action: CollectAction) {
    return 1 + getSumOfBuff(getBuffsOfActionType(action.type), CollectBuffType.RareFind)
}

export function getBuffTypeName(action: AnyBuffType) {
    return getClientData().buffTypeDetailMap[getBuffHrid(action)].name
}


export function getBuffsByEquipmentItemHrid(hrid: string, enhancementLevel: number): BasicBuff[] {
    const equipmentDetail = getClientData().itemDetailMap[hrid]?.equipmentDetail
    if (!equipmentDetail) {
        return []
    }

    function getBasicBuffByNonCombatStatKV(key: keyof NoncombatStats): BasicBuff[] {
        const basic = equipmentDetail?.noncombatStats[key] ?? 0;
        const bonus = equipmentDetail?.noncombatEnhancementBonuses[key] ?? 0;

        let action: string | null = null
        let type: AnyBuffType | null = null
        if (key.endsWith("Efficiency")) {
            action = key.substring(0, key.length - "Efficiency".length) as AnyActionType
            type = CollectBuffType.Efficiency
        } else if (key.endsWith("Experience")) {
            action = key.substring(0, key.length - "Experience".length) as AnyActionType
            type = CollectBuffType.Wisdom
        } else if (key.endsWith("RareFind")) {
            action = key.substring(0, key.length - "RareFind".length) as AnyActionType
            type = CollectBuffType.RareFind
        } else if (key.endsWith("Speed")) {
            action = key.substring(0, key.length - "Speed".length) as AnyActionType
            type = CollectBuffType.ActionSpeed
        }
        if (!action || !type) {
            console.error("Invalid key", key);
            return [];
        }
        const actions: AnyActionType[] = []
        if (Object.values(AllActionType).includes(action as AnyActionType)) {
            actions.push(action as AnyActionType)
        } else if (action === "skilling") {
            actions.push(...Object.values(AllActionType))
        }
        return actions.map(action => ({
            action,
            type,
            source: BuffSource.Equipment,
            value: basic + getClientData().enhancementLevelTotalBonusMultiplierTable[enhancementLevel] * bonus,
        }))
    }

    return Object.keys(equipmentDetail.noncombatStats)
        .flatMap((key) => getBasicBuffByNonCombatStatKV(key as keyof NoncombatStats))
}
