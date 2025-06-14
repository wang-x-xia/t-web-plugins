import type {HridInfo} from "../api/common-type";
import type {DropItem} from "./drop";


export type AnyActionType = CollectActionType | OtherActionType

export enum CollectActionType {
    Foraging = "foraging",
}

export enum OtherActionType {
    // TODO
    Alchemy = "alchemy",
    Brewing = "brewing",
    Cheesesmithing = "cheesesmithing",
    Cooking = "cooking",
    Crafting = "crafting",
    Enhancing = "enhancing",
    Milking = "milking",
    Tailoring = "tailoring",
    Woodcutting = "woodcutting",
}

export const AllActionType: Record<string, AnyActionType> = {
    ...CollectActionType,
    ...OtherActionType,
}


export interface CollectAction extends HridInfo {
    type: CollectActionType
    category: HridInfo
    levelRequirement: number
    baseTimeCost: number
    experienceGain: number
    dropTable: DropItem[]
}