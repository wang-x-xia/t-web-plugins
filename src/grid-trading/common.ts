import {createStringSetting} from "../shared/settings";


export const CurrentStockSetting = createStringSetting({
    id: "selected-stock",
    name: "Selected Stock",
    defaultValue: "",
});

export const ServerSetting = createStringSetting({
    id: "server",
    name: "Server",
    defaultValue: "http://localhost:8000",
});
