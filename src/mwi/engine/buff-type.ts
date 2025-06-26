export type AnyBuffType = NormalBuffType | EnhancingBuffType

export enum NormalBuffType {
    ActionSpeed = "/buff_types/action_speed",
    Efficiency = "/buff_types/efficiency",
    Gathering = "/buff_types/gathering",
    Wisdom = "/buff_types/wisdom",
    RareFind = "/buff_types/rare_find",
    EssenceFind = "/buff_types/essence_find",
}

export enum EnhancingBuffType {
    EnhancingSuccess = "/buff_types/enhancing_success",
}

/**
 * This is class defined by this project
 */
export enum BuffSource {
    // Equipment
    Equipment = "equipment",
    // Moo Pass
    MooPass = "experience_moo_pass_buff",
    // Community
    Community = "community",
    // House
    Room = "room",
    House = "house",
    // Tea
    Tea = "tea",
    // Level
    Level = "level",
}
