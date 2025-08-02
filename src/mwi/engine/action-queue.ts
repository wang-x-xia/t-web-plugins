import {Subject} from "rxjs";
import {info} from "../../shared/log";
import {jsonCopy} from "../../shared/utils";
import type {ActionData} from "../api/action-type";
import {ActionsUpdatedData$, InitCharacterData$} from "./engine-event";
import {defineStore} from "./store";

export const ActionQueueStore = defineStore<ActionData[]>({
    id: "action-queue",
    name: "Action Queue",
    defaultValue: [],
    enableSettings: false,
    characterBased: true,
});

InitCharacterData$.subscribe(data => {
    ActionQueueStore.update((prev) => {
        if (prev.length > 0) {
            OfflineChanges$.next(prev.flatMap(from => {
                const to = data.characterActions.find(it => it.id === from.id);
                return to ? [{from, to}] : [];
            }));
        }
        return data.characterActions;
    });

});
ActionsUpdatedData$.subscribe(({endCharacterActions}) => {
    ActionQueueStore.update((prev) => {
        return updateActionQueue(prev, endCharacterActions);
    });
});

function updateActionQueue(actions: ActionData[], changes: ActionData[]) {
    const queue = jsonCopy(actions);
    for (const action of changes) {
        const item = queue.find(it => it.id === action.id)
        if (item) {
            if (action.isDone) {
                queue.splice(queue.indexOf(item), 1);
            } else {
                queue[queue.indexOf(item)] = action
            }
        } else {
            queue.push(action);
        }
    }
    queue.sort((a, b) => a.ordinal - b.ordinal);
    info("update-action-queue", {actions, changes, queue});
    return queue;
}

export function updateActionData(change: ActionData) {
    const previous = ActionQueueStore.data$.getValue()
    const action = previous.find(it => it.id === change.id);
    ActionQueueStore.update(updateActionQueue(previous, [change]));
    if (action) {
        return change.currentCount - action.currentCount
    } else {
        return 0
    }
}

export const OfflineChanges$ = new Subject<{ from: ActionData, to: ActionData }[]>();
