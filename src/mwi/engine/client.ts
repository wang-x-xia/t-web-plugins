import type {InitClientData} from "../api/message-type";

let clientData: InitClientData | null = null;

export function initClientData(data: InitClientData) {
    clientData = data;
}

export function getClientData(): InitClientData {
    if (!clientData) {
        throw new Error("Client data not initialized");
    }
    return clientData;
}