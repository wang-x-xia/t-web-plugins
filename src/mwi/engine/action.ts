import type {ItemInput} from "../component/item-table";
import {getAlchemyInputs} from "./alchemy";
import {getClientData} from "./client";
import {getActionTypeByTypeHrid} from "./hrid";


export type AnyActionType = CollectActionType
    | ManufacturingActionType
    | AlchemyActionType
    | EnhancingActionType
    | CombatActionType

export enum CollectActionType {
    Milking = "/action_types/milking",
    Foraging = "/action_types/foraging",
    Woodcutting = "/action_types/woodcutting",
}

export enum ManufacturingActionType {
    Cheesesmithing = "/action_types/cheesesmithing",
    Crafting = "/action_types/crafting",
    Tailoring = "/action_types/tailoring",
    Cooking = "/action_types/cooking",
    Brewing = "/action_types/brewing",
}

export enum AlchemyActionType {
    Alchemy = "/action_types/alchemy",
}

export enum EnhancingActionType {
    Enhancing = "/action_types/enhancing",
}


export enum CombatActionType {
    Combat = "/action_types/combat",
}

export const AllActionType: Record<string, AnyActionType> = {
    ...AlchemyActionType,
    ...CollectActionType,
    ...CombatActionType,
    ...ManufacturingActionType,
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