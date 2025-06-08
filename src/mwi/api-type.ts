export interface HasId {
    id: string
}

export interface OwnedByCharacter {
    characterID: number
}

export interface HasTime {
    createdAt: string
    updatedAt: string
}

export interface InitCharacterData {
    type: "init_character_data"
    currentTimestamp: string
    character: Character
    characterInfo: CharacterInfo
    characterSetting: CharacterSetting
    characterActions: CharacterAction[]
    characterQuests: CharacterQuest[]
    characterSkills: CharacterSkill[]
    characterAbilities: CharacterAbility[]
    characterItems: CharacterItem[]
    consumableCombatTriggersMap: Record<string, Trigger[]>
    abilityCombatTriggersMap: Record<string, Trigger[]>
    actionTypeFoodSlotsMap: Record<string, (CharacterFoodDrinkSlot | null)[]>
    characterLoadoutMap: Record<string, CharacterLoadout>
    combatUnit: CombatUnit
    noncombatStats: NoncombatStats
    characterHouseRoomMap: Record<string, CharacterHouseRoom>
    chatHistoryByChannelMap: Record<string, any[]>
    actionTypeDrinkSlotsMap: Record<string, (CharacterFoodDrinkSlot | null)[]>
    mooPassActionTypeBuffsMap: Record<string, Buff[]>
    communityActionTypeBuffsMap: Record<string, Buff[]>
    houseActionTypeBuffsMap: Record<string, Buff[]>
    consumableActionTypeBuffsMap: Record<string, Buff[]>
    equipmentActionTypeBuffsMap: Record<string, Buff[]>
}

export interface Character extends HasId, HasTime {
    gameMode: "standard"
    name: string
}


export interface CharacterInfo extends OwnedByCharacter {
    offlineHourCap: number
    actionQueueCap: number
    loadoutSlotCap: number
    marketListingCap: number
    taskSlotCap: number
    taskCooldownHours: number
    lastTaskTimestamp: string
    unreadTaskCount: number
    totalTaskPoints: number
    redeemedTaskPoints: number
    mooPassExpireTime: string
}

export interface CharacterSetting {
    characterID: number
}

export interface CharacterAction extends HasId, HasTime, OwnedByCharacter {
    actionHrid: string
    hasMaxCount: boolean
    maxCount: number
    currentCount: number
    wave: number
}

export interface CharacterQuest extends HasId, HasTime, OwnedByCharacter {
    category: "/quest_category/random_task"
    type: "/quest_type/action" | "/quest_type/monster"
    actionHrid: string
    monsterHrid: string
    goalCount: number
    currentCount: number
    /**
     * JSON of ItemReward[]
     */
    itemRewardsJSON: string
    status: "/quest_status/in_progress"
    coinRerollCount: number
    cowbellRerollCount: number
    mooPassRerollCount: number
}

export interface ItemReward {
    itemHrid: string
    count: number
}

export interface CharacterSkill extends HasTime, OwnedByCharacter {
    skillHrid: string
    experience: number
    level: number
    offlineExperience: number
}

export interface CharacterAbility extends HasTime, OwnedByCharacter {
    abilityHrid: string
    experience: number
    level: number
    slotNumber: number
}

export interface CharacterItem extends HasId, HasTime, OwnedByCharacter {
    itemLocationHrid: string
    itemHrid: string
    enhancementLevel: number
    count: number
    offlineCount: number
    hash: string
}

export interface Trigger {
    dependencyHrid: string
    conditionHrid: string
    comparatorHrid: string
    value: number
}

export interface CharacterFoodDrinkSlot extends OwnedByCharacter {
    actionTypeHrid: string
    consumableSlotTypeHrid: string
    slotIndex: number
    itemHrid: string
    isActive: boolean
    duration: number
}

export interface CharacterLoadout extends HasId, OwnedByCharacter {
    actionTypeHrid: string
    name: string
    isDefault: boolean
    suppressValidation: boolean
    /**
     * Value is the hash
     */
    wearableMap: Record<string, string>
    foodItemHrids: string[3]
    drinkItemHrids: string[3]
    abilityMap: Record<"1" | "2" | "3" | "4" | "5", string>
}

export interface CombatUnit {
    isActive: boolean
    isPlayer: boolean
    character: Character
}

export interface NoncombatStats {
    skillingSpeed: number
    milkingSpeed: number
    foragingSpeed: number
    woodcuttingSpeed: number
    cheesesmithingSpeed: number
    craftingSpeed: number
    tailoringSpeed: number
    cookingSpeed: number
    brewingSpeed: number
    alchemySpeed: number
    taskSpeed: number
    milkingEfficiency: number
    foragingEfficiency: number
    woodcuttingEfficiency: number
    enhancingSuccess: number
    skillingRareFind: number
}

export interface CharacterHouseRoom extends HasTime, OwnedByCharacter {
    houseRoomHrid: string
    level: number
}

export interface Buff {
    uniqueHrid: string
    typeHrid: string
    ratioBoost: number
    ratioBoostLevelBonus: number
    flatBoost: number
    flatBoostLevelBonus: number
}