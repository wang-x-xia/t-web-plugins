import {publishEvent} from "../../shared/mq";
import type {LootLog} from "../api/loot-type";
import type {LootLogData} from "../api/message-type";
import {LootLogUpdatedEvent} from "../lifecycle";


let lootLog: LootLog[] | null = null;

export function getLootLog(): LootLog[] {
    if (lootLog === null) {
        throw new Error("Loot log is not initialized");
    }
    return lootLog;
}

export function updateLootLog(data: LootLogData) {
    lootLog = data.lootLog;
    publishEvent(LootLogUpdatedEvent, null);
}