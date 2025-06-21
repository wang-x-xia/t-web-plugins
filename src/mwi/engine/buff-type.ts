import type {AnyActionType} from "./action";
import {EquipmentLocation, EquipmentTool} from "./equipment";

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

export interface BasicBuff {
    action: AnyActionType,
    type: AnyBuffType,
    source: BuffSource,
    value: number
}

export type Buff = EquipmentBuff | BasicBuff

export interface EquipmentBuff extends BasicBuff {
    source: BuffSource.Equipment
    equipments: {
        location: EquipmentLocation | EquipmentTool
        itemHrid: string
        enhancementLevel: number
        value: number
    }[]
}
