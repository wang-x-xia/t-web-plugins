import type {ActionData} from "../api/action-type";

export interface WithCharacterId {
    characterId: string
}

let currentActionData: ActionData | null = null;

export function updateCurrentActionData(newActionData: ActionData): number {
    const previousAction = currentActionData;
    currentActionData = newActionData;
    if (previousAction?.actionHrid === newActionData.actionHrid) {
        return newActionData.currentCount - previousAction.currentCount;
    }
    return 0;
}