import {createApp} from "../shared/view";
import {dailyPlugin} from "./plugins/daily";
import {listStockPlugin} from "./plugins/list-stock";
import {settingsPlugin} from "./plugins/settings";

createApp({})
settingsPlugin()
listStockPlugin()
dailyPlugin()