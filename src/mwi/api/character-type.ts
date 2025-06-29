import type {HasId, HasTime} from "./common-type";

export interface OwnedByCharacter {
    characterID: number
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

export interface CharacterQuest extends HasId, HasTime, OwnedByCharacter {
    category: "/quest_category/random_task"
    type: "/quest_type/action" | "/quest_type/monster"
    actionHrid: string
    monsterHrid: string
    goalCount: number
    currentCount: number
    /**
     * JSON of ItemCount[]
     */
    itemRewardsJSON: string
    status: "/quest_status/in_progress"
    coinRerollCount: number
    cowbellRerollCount: number
    mooPassRerollCount: number
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

export interface CharacterHouseRoom extends HasTime, OwnedByCharacter {
    houseRoomHrid: string
    level: number
}

