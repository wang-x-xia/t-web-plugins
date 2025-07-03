import {sum} from "../../shared/list";
import {warn} from "../../shared/log";
import type {NoncombatBuffs} from "../api/buff-type";
import {type AnyActionType, EnhancingActionType} from "./action";
import {type AnyBuffType, EnhancingBuffType, NormalBuffType} from "./buff-type";
import {getClientData} from "./client";


export const EmptyBuffData: Record<AnyBuffType, number> = {
    [NormalBuffType.ActionSpeed]: 0,
    [NormalBuffType.Efficiency]: 0,
    [NormalBuffType.Gathering]: 0,
    [NormalBuffType.Wisdom]: 0,
    [NormalBuffType.RareFind]: 0,
    [NormalBuffType.EssenceFind]: 0,
    [EnhancingBuffType.EnhancingSuccess]: 0,
}

export function getBuffTypeName(action: AnyBuffType) {
    return getClientData().buffTypeDetailMap[action].name
}

export function getKeysOfNonCombatStat(action: AnyActionType, buffType: AnyBuffType): (keyof NoncombatBuffs)[] {
    const shortAction = action.substring("/action_types/".length)
    switch (buffType) {
        case NormalBuffType.Wisdom:
            return [
                `${shortAction}Experience` as keyof NoncombatBuffs,
                "skillingExperience",
            ]
        case EnhancingBuffType.EnhancingSuccess:
            return ["enhancingSuccess"]
        case NormalBuffType.Efficiency:
            if (action === EnhancingActionType.Enhancing) {
                return []
            }
            return [
                `${shortAction}Efficiency` as keyof NoncombatBuffs,
                "skillingEfficiency",
            ]
        case NormalBuffType.ActionSpeed:
            return [
                `${shortAction}Speed` as keyof NoncombatBuffs,
                "skillingSpeed",
            ]
        case NormalBuffType.Gathering:
            return ["gatheringQuantity"]
        case NormalBuffType.EssenceFind:
            return ["skillingEssenceFind"]
        case NormalBuffType.RareFind:
            return [
                `${shortAction}RareFind` as keyof NoncombatBuffs,
                "skillingRareFind",
            ]
        default:
            warn("unknown-buff-type", {action, buffType})
            return []
    }
}

export function getBuffValueOfEquipment(action: AnyActionType, buffType: AnyBuffType, hrid: string, enhancementLevel: number): number {
    const keys = getKeysOfNonCombatStat(action, buffType);
    if (!keys.length) {
        return 0
    }
    const equipmentDetail = getClientData().itemDetailMap[hrid]?.equipmentDetail
    if (!equipmentDetail) {
        warn("no-equipment-details", {hrid})
        return 0
    }
    const basic = sum(keys.map((key) => equipmentDetail.noncombatStats[key] ?? 0))
    const bonus = sum(keys.map((key) => equipmentDetail.noncombatEnhancementBonuses[key] ?? 0))
    return basic + getClientData().enhancementLevelTotalBonusMultiplierTable[enhancementLevel] * bonus
}


export function getBuffValueOfTea(action: AnyActionType, buffType: AnyBuffType, hrid: string): number {
    const keys = getKeysOfNonCombatStat(action, buffType);
    if (!keys.length) {
        return 0
    }
    const consumableDetail = getClientData().itemDetailMap[hrid]?.consumableDetail
    if (!consumableDetail || !consumableDetail.buffs) {
        warn("no-tea-details", {hrid})
        return 0
    }
    return sum(consumableDetail.buffs.filter(it => it.typeHrid === buffType)
        .map(it => it.flatBoost))
}
