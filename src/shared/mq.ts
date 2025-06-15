import {log, warn} from "./log";

export interface EventDefine<T> {
    type: string
}

export interface Handler<T> {
    (data: T, event: EventDefine<T>): void
}

export interface Callback<T> {
    id: string
    events: EventDefine<T>[]
    handle: Handler<T>
}

const callbacks: Record<string, Callback<any>> = {}


export function registerAnonymousHandler<T>(events: EventDefine<T>[], handle: Handler<T>): string {
    const id = crypto.randomUUID();
    registerCallback({id, events, handle})
    return id
}


export function registerHandler<T>(id: string, events: EventDefine<T>[], handle: Handler<T>) {
    registerCallback({id, events, handle})
}


export function registerCallback<T>(callback: Callback<T>) {
    log("register", {callback});
    if (callbacks[callback.id]) {
        warn("duplicated-callback", {previous: callbacks[callback.id], callback});
    }
    callbacks[callback.id] = {...callback}
}

export function unregisterCallback(id: string) {
    log("unregister", {id});
    delete callbacks[id]
}


export function publishEvent<T>(event: EventDefine<T>, data: T) {
    log("event", {event, data});
    const callbacksForEvent = Object.values(callbacks)
        .filter(cb => cb.events.includes(event));
    callbacksForEvent.forEach(cb => {
        try {
            log("call", {event, cb});
            cb.handle(data, event);
        } catch (e) {
            console.error(e);
        }
    });
}

