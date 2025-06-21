import type {InitClientData} from "../api/message-type";
import {type CollectAction, CollectActionType} from "./action";
import {BuffSource} from "./buff";
import {type DropItem, DropType} from "./drop";
import {InitClientSubject} from "./engine-event";
import {getActionTypeHrid, getBuffSourceByHrid} from "./hrid";

let clientData: InitClientData | null = null;

export function getClientData(): InitClientData {
    if (!clientData) {
        throw new Error("Client data not initialized");
    }
    return clientData;
}

InitClientSubject.subscribe((data: InitClientData) => {
    clientData = data;
    collectActions = initCollectActions(data);
    buffSourceNames = initBuffSourceNames(data);
});

let collectActions: Record<CollectActionType, CollectAction[]> | null = null;

export function getCollectActions(actionType: CollectActionType): CollectAction[] {
    if (!collectActions) {
        throw new Error("Collect actions not initialized");
    }
    return collectActions[actionType]
}


function initCollectActions(data: InitClientData) {
    return Object.fromEntries(Object.values(CollectActionType).map((key) => {
        const typeHrid = getActionTypeHrid(key);

        const collectActions = Object.values(data.actionDetailMap)
            .filter((action) => action.type === typeHrid)
            .map<CollectAction>((action) => {
                const dropTable = Object.entries({
                    [DropType.Common]: action.dropTable,
                    [DropType.Essence]: action.essenceDropTable,
                    [DropType.Rare]: action.rareDropTable,
                }).flatMap(([dropType, dropItems]) => {
                    if (dropItems) {
                        return dropItems.map<DropItem>((drop) => ({
                            itemHrid: drop.itemHrid,
                            type: dropType as DropType,
                            dropRate: drop.dropRate,
                            minCount: drop.minCount,
                            maxCount: drop.maxCount,
                        }));
                    } else {
                        return [];
                    }
                });
                return {
                    hrid: action.hrid,
                    name: action.name,
                    sortIndex: action.sortIndex,
                    type: key,
                    category: data.actionCategoryDetailMap[action.category],
                    levelRequirement: action.levelRequirement.level,
                    baseTimeCost: action.baseTimeCost / 1e9,
                    experienceGain: action.experienceGain.value,
                    dropTable: dropTable,
                };
            });
        return [key, collectActions];
    })) as Record<CollectActionType, CollectAction[]>
}

let buffSourceNames: Record<BuffSource, string> | null = null;

export function getBuffSourceName(source: BuffSource) {
    if (!buffSourceNames) {
        throw new Error("Buff source names not initialized");
    }
    return buffSourceNames[source] ?? source;
}


function initBuffSourceNames(data: InitClientData) {
    return Object.fromEntries([
        ...Object.values(data.communityBuffTypeDetailMap)
            .map((buffDetails) =>
                [getBuffSourceByHrid(buffDetails.buff.uniqueHrid), "Community Buff: " + buffDetails.name]),
        ...Object.values(data.itemDetailMap).filter(itemDetails => itemDetails.consumableDetail?.buffs)
            .flatMap((itemDetails) =>
                itemDetails.consumableDetail!.buffs!.map((buff) => {
                    return [getBuffSourceByHrid(buff.uniqueHrid), "Item: " + itemDetails.name]
                })),
        ...Object.values(data.houseRoomDetailMap).flatMap((roomDetails) =>
            [...roomDetails.actionBuffs, ...roomDetails.globalBuffs].map((buff) =>
                [getBuffSourceByHrid(buff.uniqueHrid), "House: " + roomDetails.name])),
        ...[
            [BuffSource.MooPassExperience, "Moo Pass"],
            [BuffSource.Equipment, "Equipment"],
        ]
    ]) as Record<BuffSource, string>
}

