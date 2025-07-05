import type {ActionCategoryDetails, ActionData, ActionDetails, DropInfo} from "./action-type";
import type {BuffDetails, BuffTypeDetails, CommunityBuffTypeDetails, NoncombatBuffs} from "./buff-type";
import type {
    Character,
    CharacterAbility,
    CharacterFoodDrinkSlot,
    CharacterHouseRoom,
    CharacterInfo,
    CharacterItem,
    CharacterLoadout,
    CharacterQuest,
    CharacterSetting,
    CharacterSkill,
    CombatUnit
} from "./character-type";
import type {
    AbilityDetails,
    CombatMonsterDetails,
    CombatTrigger,
    CombatTriggerComparatorDetails,
    CombatTriggerConditionDetails,
    CombatTriggerDependencyDetails
} from "./combat-type";
import type {HridInfo} from "./common-type";
import type {EquipmentTypeDetails} from "./equipment-type";
import type {HouseRoomDetails} from "./house-type";
import type {ItemCategoryDetails, ItemDetails, ItemLocationDetails} from "./item-type";
import type {LootLog} from "./loot-type";
import type {SkillDetails} from "./skill-type";
import type {RandomTaskTypeDetails, ShopItemDetails} from "./task-type";


export interface InitClientData {
    type: "init_client_data"
    gameVersion: string
    versionTimestamp: string
    currentTimestamp: string
    levelExperienceTable: number[],
    skillDetailMap: Record<string, SkillDetails>,
    abilityDetailMap: Record<string, AbilityDetails>,
    abilitySlotsLevelRequirementList: number[],
    itemDetailMap: Record<string, ItemDetails>,
    itemCategoryDetailMap: Record<string, ItemCategoryDetails>,
    itemLocationDetailMap: Record<string, ItemLocationDetails>,
    equipmentTypeDetailMap: Record<string, EquipmentTypeDetails>
    combatStyleDetailMap: Record<string, HridInfo>
    damageTypeDetailMap: Record<string, HridInfo>
    combatMonsterDetailMap: Record<string, CombatMonsterDetails>
    combatTriggerDependencyDetailMap: Record<string, CombatTriggerDependencyDetails>
    combatTriggerConditionDetailMap: Record<string, CombatTriggerConditionDetails>
    combatTriggerComparatorDetailMap: Record<string, CombatTriggerComparatorDetails>
    enhancementLevelSuccessRateTable: number[],
    enhancementLevelTotalBonusMultiplierTable: number[],
    randomTaskTypeDetailMap: Record<string, RandomTaskTypeDetails>
    taskShopItemDetailMap: Record<string, ShopItemDetails>
    shopCategoryDetailMap: Record<string, HridInfo>
    shopItemDetailMap: Record<string, ShopItemDetails>
    actionDetailMap: Record<string, ActionDetails>
    actionCategoryDetailMap: Record<string, ActionCategoryDetails>
    buffTypeDetailMap: Record<string, BuffTypeDetails>
    openableLootDropMap: Record<string, DropInfo[]>
    houseRoomDetailMap: Record<string, HouseRoomDetails>
    purchaseBundleDetailMap: Record<string, any>
    buyableUpgradeDetailMap: Record<string, any>
    chatIconDetailMap: Record<string, any>
    guildCharacterRoleDetailMap: Record<string, any>
    leaderboardTypeDetailMap: Record<string, any>
    leaderboardCategoryDetailMap: Record<string, any>
    communityBuffTypeDetailMap: Record<string, CommunityBuffTypeDetails>
}

export interface InitCharacterData {
    type: "init_character_data"
    currentTimestamp: string
    character: Character
    characterInfo: CharacterInfo
    characterSetting: CharacterSetting
    characterActions: ActionData[]
    characterQuests: CharacterQuest[]
    characterSkills: CharacterSkill[]
    characterAbilities: CharacterAbility[]
    characterItems: CharacterItem[]
    consumableCombatTriggersMap: Record<string, CombatTrigger[]>
    abilityCombatTriggersMap: Record<string, CombatTrigger[]>
    actionTypeFoodSlotsMap: Record<string, (CharacterFoodDrinkSlot | null)[]>
    characterLoadoutMap: Record<string, CharacterLoadout>
    combatUnit: CombatUnit
    noncombatStats: NoncombatBuffs
    characterHouseRoomMap: Record<string, CharacterHouseRoom>
    chatHistoryByChannelMap: Record<string, any[]>
    actionTypeDrinkSlotsMap: Record<string, (CharacterFoodDrinkSlot | null)[]>
    mooPassActionTypeBuffsMap: Record<string, BuffDetails[]>
    communityActionTypeBuffsMap: Record<string, BuffDetails[]>
    houseActionTypeBuffsMap: Record<string, BuffDetails[]>
    consumableActionTypeBuffsMap: Record<string, BuffDetails[]>
    equipmentActionTypeBuffsMap: Record<string, BuffDetails[]>
    offlineItems: CharacterItem[]
}


export interface LootLogData {
    type: "loot_log_updated"
    lootLog: LootLog[],
}

export interface ActionCompletedData {
    type: "action_completed"
    endCharacterAction: ActionData
    endCharacterItems: CharacterItem[]
    endCharacterAbilities: CharacterAbility[] | null
    endCharacterSkills: CharacterSkill[] | null
    endCharacterQuests: CharacterQuest[] | null
}

export interface ItemUpdatedData {
    type: "items_updated"
    endCharacterItems: CharacterItem[] | null
}

export interface ActionsUpdatedData {
    type: "actions_updated"
    endCharacterActions: ActionData[]
}

export interface LootOpened {
    type: "loot_opened"
    openedItem: CharacterItem
    gainedItems: CharacterItem[]
}