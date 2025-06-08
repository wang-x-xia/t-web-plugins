import {setupEngineHook} from "./engine";
import {foragingPlugin} from "./foraging-plugins";
import {setupApp} from "./view";

setupEngineHook();

window.addEventListener("load", (e) => {
    setupApp();
});

foragingPlugin()