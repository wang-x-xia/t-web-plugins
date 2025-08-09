import {createStringSelectSetting} from "../shared/settings";
import stockList from "./data/stock-list.json";


export const CurrentStockSetting = createStringSelectSetting({
    id: "selected-stock",
    name: "Selected Stock",
    defaultValue: "",
}, stockList.map(({code, name}) => ({name, value: code})))
