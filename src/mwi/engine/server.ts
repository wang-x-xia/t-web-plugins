export function isTestServer(): boolean {
    return window.location.host === "test.milkywayidle.com"
}

export function isProductionServer(): boolean {
    return window.location.host === "www.milkywayidle.com"
}