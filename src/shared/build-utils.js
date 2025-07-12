import {readFileSync} from "node:fs";
import path from "node:path";

export const isProduction = process.argv.includes("--production")

/**
 * Resolve the full imported path as its package and child path
 * @return {[string, string]}
 */
function resolvePkgAndChild(id) {
    if (id.startsWith("@")) {
        const [scope, pkg, path] = id.split("/", 3);
        return [`${scope}/${pkg}`, path];
    }
    return id.split("/", 2);
}

/**
 * Get the CDN url for a package
 * @param id
 * @return {string}
 */
export function resolveCdnUrl(id) {
    const [pkg, child] = resolvePkgAndChild(id);
    const pkgJson = readFileSync(path.resolve("node_modules", pkg, "package.json"), "utf8");
    const {version} = JSON.parse(pkgJson);
    let pkgUrl = `https://esm.sh/${pkg}@${version}`
    if (child) {
        pkgUrl += `/${child}`
    }
    if (!isProduction) {
        pkgUrl += "?dev"
    }
    return pkgUrl
}

/**
 * Get exported name of the module
 * @param id
 * @return {string}
 */
export function exportName(id) {
    return id.replace(/[-\/]/g, "_").toUpperCase()
}