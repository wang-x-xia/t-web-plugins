import type {InitClientData} from "../api/message-type";
import {type CollectAction, CollectActionType} from "./action";
import {type DropItem, DropType} from "./drop";
import {getActionTypeHrid} from "./hrid";

let clientData: InitClientData | null = null;
let collectActions: Record<CollectActionType, CollectAction[]> | null = null;

export function initClientData(data: InitClientData) {
    clientData = data;

    collectActions = Object.values(CollectActionType).reduce((acc, key) => {
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
        return {...acc, [key]: collectActions};
    }, {} as Record<CollectActionType, CollectAction[]>)
}

export function getClientData(): InitClientData {
    if (!clientData) {
        throw new Error("Client data not initialized");
    }
    return clientData;
}


export function getCollectActions(actionType: CollectActionType): CollectAction[] {
    if (!collectActions) {
        throw new Error("Collect actions not initialized");
    }
    return collectActions[actionType]
}

