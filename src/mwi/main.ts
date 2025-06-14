import {log} from "../shared/log";
import {setupEngineHook} from "./engine/engine";
import {setupMarketData} from "./engine/market";
import {foragingPlugin} from "./foraging-plugins";
import {setupApp} from "./view";

async function main() {
    setupEngineHook();

    window.addEventListener("load", () => {
        setupApp();
    });

    await setupMarketData();

    foragingPlugin()
}

main()
    .catch((e) => {
        console.error({"log-event": "init-failed"}, e);
    })
    .finally(() => {
        log("init-finished", {})
    })
