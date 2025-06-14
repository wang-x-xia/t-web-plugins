import {type AnyActionType, type CollectAction} from "./action";
import {currentCharacter} from "./character";
import {getClientData} from "./client";
import {getBuffHrid} from "./hrid";

export type AnyBuffType = CollectBuffType | OtherBuffType | CombatBuffType

export enum CollectBuffType {
    ActionSpeed = "action_speed",
    Efficiency = "efficiency",
    Gathering = "gathering",
    Wisdom = "wisdom",
    RareFind = "rare_find"
}

export enum OtherBuffType {
    // TODO
    EnhancingSuccess = "enhancing_success",
}

export enum CombatBuffType {
    PowerLevel = "power_level",
    IntelligenceLevel = "intelligence_level",
    MpRegen = "mp_regen",
    MagicLevel = "magic_level",
    RangeLevel = "range_level",
    DefenseLevel = "defense_level",
    StaminaLevel = "stamina_level",
    HpRegen = "hp_regen",
    AttackLevel = "attack_level",
    AttackSpeed = "attack_speed",
}

export const AllBuffType: Record<string, AnyBuffType> = {
    ...CollectBuffType,
    ...OtherBuffType,
    ...CombatBuffType,
}


export enum BuffSource {
    Equipment = "equipment",
    // Moo Pass
    MooPassExperience = "experience_moo_pass_buff",
    // Community
    CommunityExperience = "experience_community_buff",
    CommunityProduction = "production_community_buff",
    GatheringCommunity = "gathering_community_buff",
    EnhancingCommunity = "enhancing_community_buff",
    CombatCommunity = "combat_community_buff",
    // House
    HouseEfficiency = "house_efficiency",
    HouseExperience = "house_experience",
    HouseRareFind = "house_rare_find",
    HouseActionSpeed = "house_action_speed",
    HousePowerLevel = "house_power_level",
    HouseEnhancingSuccess = "house_enhancing_success",
    // Tea
    WisdomTea = "wisdom_tea",
    GatheringTea = "gathering_tea",
    EfficiencyTea = "efficiency_tea",
}

export interface Buff {
    action: AnyActionType,
    type: AnyBuffType,
    source: BuffSource,
    ratioBoost: number
    ratioBoostLevelBonus: number
    flatBoost: number
    flatBoostLevelBonus: number
}

export function getSumOfBuff(buffs: Buff[], buffType: AnyBuffType): number {
    const typeBuff = buffs.filter(b => b.type === buffType);
    return typeBuff.reduce((acc, b) => acc + b.flatBoost, 0)
}

export function getBuffsOfActionType(actionType: AnyActionType): Buff[] {
    return currentCharacter().buffs.filter(b => b.action === actionType);
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
