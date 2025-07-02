import type {InitClientData} from "../api/message-type";
import {InitClientSubject} from "./engine-event";

let clientData: InitClientData | null = null;

export function getClientData(): InitClientData {
    if (!clientData) {
        throw new Error("Client data not initialized");
    }
    return clientData;
}

InitClientSubject.subscribe((data: InitClientData) => {
    clientData = data;
});
