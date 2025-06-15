import type {ItemInput} from "../component/item-table";
import {getClientData} from "./client";
import {resolveItemHash} from "./hrid";


export function getAlchemyInputs(actionHrid: string, primaryItemHash: string, secondaryItemHash: string): ItemInput[] {
    if (!primaryItemHash) {
        return [];
    }
    const {hrid} = resolveItemHash(primaryItemHash)
    const alchemyDetail = getClientData().itemDetailMap[hrid]?.alchemyDetail
    if (!alchemyDetail) {
        console.error("Alchemy not found for", primaryItemHash);
        return [];
    }
    return [
        {hrid: hrid, count: alchemyDetail.bulkMultiplier},
    ]
}