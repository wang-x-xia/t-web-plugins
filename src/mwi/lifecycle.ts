import {log} from "../shared/log";

export enum LifecycleEvent {
    CharacterLoaded = "character-loaded",
    LootLogUpdated = "loot-log-updated"
}

interface NamedCallback {
    name: string;
    events: LifecycleEvent[];
    cb: () => void;
}

const callbacks: Record<string, NamedCallback> = {}

export function registerLifecycle(name: string, events: LifecycleEvent[], cb: () => void) {
    callbacks[name] = {name, events, cb};
}

export function unregisterLifecycle(name: string) {
    delete callbacks[name];
}

export function triggerLifecycleEvent(event: LifecycleEvent) {
    const callbacksForEvent = Object.values(callbacks).filter(cb => cb.events.includes(event));
    callbacksForEvent.forEach(cb => {
        try {
            log("lifecycle", {"event": event, "name": cb.name});
            cb.cb();
        } catch (e) {
            console.error(e);
        }
    });
}

