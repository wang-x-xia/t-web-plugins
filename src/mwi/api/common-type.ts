export interface HasId {
    id: string
}

export interface HasTime {
    createdAt: string
    updatedAt: string
}

export interface HridInfo {
    hrid: string;
    name: string;
    sortIndex: number;
}

export interface ItemCount {
    itemHrid: string
    count: number
}

export interface LevelRequirement {
    skillHrid: string
    level: number
}