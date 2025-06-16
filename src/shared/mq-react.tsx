import {useEffect, useState} from "react";
import {type EventDefine, registerAnonymousHandler, unregisterCallback} from "./mq";


export function useRecentEvents<T>(event: EventDefine<T>, limit = -1): T[] {
    const [events, setEvents] = useState<T[]>([]);
    useEffect(() => {
        const handler = (data: T) => setEvents(previous => {
            const result = [...previous, data]
            if (limit !== -1 && result.length > limit) {
                return result.slice(-limit);
            } else {
                return result
            }
        })
        const id = registerAnonymousHandler([event], handler);
        return () => unregisterCallback(id)
    }, [limit]);
    return events
}

