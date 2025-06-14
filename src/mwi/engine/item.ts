import {getClientData} from "./client";

export function getItemName(itemHrid: string): string {
    return getClientData().itemDetailMap[itemHrid].name;
}