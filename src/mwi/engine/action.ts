import type {HridInfo} from "../api/common-type";
import type {ItemInput} from "../component/item-table";
import {getAlchemyInputs} from "./alchemy";
import {getClientData} from "./client";
import type {DropItem} from "./drop";
import {getActionTypeByTypeHrid} from "./hrid";


export type AnyActionType = AlchemyActionType | CollectActionType | OtherActionType

export enum AlchemyActionType {
    Alchemy = "alchemy",
}

export enum CollectActionType {
    Foraging = "foraging",
}


export enum OtherActionType {
    // TODO
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
    ...AlchemyActionType,
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


export function getActionName(actionHrid: string): string {
    return getClientData().actionDetailMap[actionHrid]?.name ?? actionHrid;
}


export function getActionTypeByAction(actionHrid: string): AnyActionType | null {
    const typeHrid = getClientData().actionDetailMap[actionHrid]?.type;
    if (typeHrid === undefined) {
        return null;
    }
    return getActionTypeByTypeHrid(typeHrid);
}


export function getActionInputs(actionHrid: string, primaryItemHash: string, secondaryItemHash: string): ItemInput[] {
    switch (getActionTypeByAction(actionHrid)) {
        default:
            return getClientData().actionDetailMap[actionHrid]?.inputItems?.map(inputItem => ({
                hrid: inputItem.itemHrid,
                count: inputItem.count,
            })) ?? [];
        case AlchemyActionType.Alchemy:
            return getAlchemyInputs(actionHrid, primaryItemHash, secondaryItemHash);
    }

}