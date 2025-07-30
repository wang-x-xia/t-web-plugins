const __platform__: "browser" | "tampermonkey" = "browser";

export function getStringValue<T>(key: string, defaultValue: T): string | T {
    if (__platform__ === "browser") {
        return localStorage.getItem(key) ?? defaultValue;
    } else if (__platform__ === "tampermonkey") {
        return GM_getValue(key, defaultValue);
    } else {
        return defaultValue;
    }
}

export function setStringValue(key: string, value: string) {
    if (__platform__ === "browser") {
        localStorage.setItem(key, value);
    } else if (__platform__ === "tampermonkey") {
        GM_setValue(key, value);
    } else {
    }
}