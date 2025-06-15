import {log} from "../shared/log";
import {setupEngineHook} from "./engine/engine";
import {setupMarketData} from "./engine/market";
import {foragingPlugin} from "./plugins/foraging-plugins";
import {lootTrackerPlugin} from "./plugins/loot-tracker";
import {setupApp} from "./view";

async function main() {
    setupEngineHook();

    window.addEventListener("load", () => {
        setupApp();
    });

    await setupMarketData();

    foragingPlugin()
    lootTrackerPlugin()
}

main()
    .catch((e) => {
        console.error({"log-event": "init-failed"}, e);
    })
    .finally(() => {
        log("init-finished", {})
    })
