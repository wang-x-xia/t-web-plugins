import {log} from "../shared/log";
import {setupEngineHook} from "./engine/engine";
import {setupMarketData} from "./engine/market";
import {actionStatPlugin} from "./plugins/action-stat-plugin";
import {assetPlugin} from "./plugins/asset-plugin";
import {inventoryChangesPlugin} from "./plugins/inventory-changes-plugin";
import {lootTrackerPlugin} from "./plugins/loot-tracker";
import {priceChangePlugin} from "./plugins/price-change-plugin";
import {foragingPlugin} from "./plugins/profit-plugins";
import {setupApp} from "./view";

setupEngineHook();

window.addEventListener("load", () => {
    setupApp();
});

setupMarketData().catch((e) => {
    console.error({"log-event": "init-failed"}, e);
}).finally(() => {
    log("init-finished", {})
})

foragingPlugin()
lootTrackerPlugin()
actionStatPlugin()
inventoryChangesPlugin()
priceChangePlugin()
assetPlugin()