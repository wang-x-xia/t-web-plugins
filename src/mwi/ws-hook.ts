import {log} from "../shared/log";
import {Request$, Response$} from "./engine/engine-event";

unsafeWindow.WebSocket = new Proxy(WebSocket, {
    construct(target, args: ConstructorParameters<typeof WebSocket>) {
        log("ws-created", {"args": args});
        const ws = new target(...args);
        ws.addEventListener("message", (event) => {
            Response$.next(JSON.parse(event.data));
        });
        const _send = ws.send.bind(ws);
        ws.send = (data: any) => {
            Request$.next(JSON.parse(data));
            _send(data);
        };
        return ws;
    },
});
log("ws-hooked", {});
if (localStorage.getItem("initClientData") != null) {
    Response$.next(JSON.parse(localStorage.getItem("initClientData")!!));
}
