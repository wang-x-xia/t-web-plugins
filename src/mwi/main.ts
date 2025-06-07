import {setupEngineHook} from "./engine";
import {testPlugin} from "./test-plugin";
import {setupApp} from "./view";

setupEngineHook();

window.addEventListener("load", (e) => {
    setupApp();
});

testPlugin();