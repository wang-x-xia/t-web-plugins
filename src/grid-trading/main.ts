import {createApp} from "../shared/view";
import {dailyPlugin} from "./plugins/daily";
import {listStockPlugin} from "./plugins/list-stock";

createApp({})
listStockPlugin()
dailyPlugin()