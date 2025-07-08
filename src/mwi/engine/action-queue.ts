import {Subject} from "rxjs";
import {info} from "../../shared/log";
import {jsonCopy} from "../../shared/utils";
import type {ActionData} from "../api/action-type";
import {ActionsUpdatedData$, InitCharacterData$} from "./engine-event";
import {defineStore, storeSubject} from "./store";

export const ActionQueueStore = defineStore<ActionData[]>({
    id: "action-queue",
    name: "Action Queue",
    defaultValue: [],
    enableSettings: false,
    characterBased: true,
});

export const ActionQueue$ = storeSubject(ActionQueueStore);

InitCharacterData$.subscribe(data => {
    if (ActionQueue$.getValue().length > 0) {
        OfflineChanges$.next(ActionQueue$.getValue().flatMap(from => {
            const to = data.characterActions.find(it => it.id === from.id);
            return to ? [{from, to}] : [];
        }));
    }
    ActionQueue$.next(data.characterActions);
});
ActionsUpdatedData$.subscribe(({endCharacterActions}) => {
    updateActionQueue(ActionQueue$.getValue(), endCharacterActions);
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
    ActionQueue$.next(queue);
}

export function updateActionData(change: ActionData) {
    const previous = ActionQueue$.getValue()
    const action = previous.find(it => it.id === change.id);
    updateActionQueue(previous, [change]);
    if (action) {
        return change.currentCount - action.currentCount
    } else {
        return 0
    }
}

export const OfflineChanges$ = new Subject<{ from: ActionData, to: ActionData }[]>();
