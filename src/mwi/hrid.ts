export enum Action {
    Alchemy = "alchemy",
    Brewing = "brewing",
    Cheesesmithing = "cheesesmithing",
    Combat = "combat",
    Cooking = "cooking",
    Crafting = "crafting",
    Enhancing = "enhancing",
    Foraging = "foraging",
    Milking = "milking",
    Tailoring = "tailoring",
    Woodcutting = "woodcutting",
}

export function getActionTypeHrid(action: Action): string {
    return `/action_types/${action}`;
}

export function getActionByHrid(hrid: string): Action | null {
    return Object.values(Action).find((action) => getActionTypeHrid(action) === hrid) || null;
}

export function getSkillHrid(action: Action): string {
    return `/skills/${action}`;
}

export enum BuffType {
    ActionSpeed = "action_speed",
    Efficiency = "efficiency",
    Gathering = "gathering",
    Wisdom = "wisdom",
    RareFind = "rare_find",
    EnhancingSuccess = "enhancing_success",
    // Combat
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

export function getBuffHrid(buffType: BuffType): string {
    return `/buff_types/${buffType}`;
}

export function getBuffTypeByHrid(hrid: string): BuffType | null {
    return Object.values(BuffType).find((buffType) => getBuffHrid(buffType) === hrid) || null;
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

export function getBuffUniqueHrid(buffUnique: BuffSource): string {
    return `/buff_uniques/${buffUnique}`;
}

export function getBuffSourceByHrid(hrid: string): BuffSource | null {
    return Object.values(BuffSource).find((buffSource) => getBuffUniqueHrid(buffSource) === hrid) || null;
}