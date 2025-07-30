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
 * @param id {string}
 * @return {string}
 */
export function resolveCdnUrl(id) {
    const [pkg, child] = resolvePkgAndChild(id);
    const dependencies = {}
    const selfVersion = collectVersion(pkg, dependencies)
    let pkgUrl = `https://esm.sh/${pkg}@${selfVersion}`
    if (child) {
        pkgUrl += `/${child}`
    }
    const searchParams = []
    if (!isProduction) {
        // Add dev flag
        searchParams.push("dev")
    }
    if (Object.entries(dependencies).length > 0) {
        // Add dependency versions
        const deps = Object.entries(dependencies).map(([subPkg, version]) => `${subPkg}@${version}`).join(",")
        searchParams.push(`deps=${deps}`)
    }
    if (searchParams) {
        pkgUrl += "?" + searchParams.join("&")
    }
    return pkgUrl
}

/**
 * Collect the package version information
 *
 * @param pkg {string} is the pkg
 * @param versions {Record<string, string>} is the map of dependency version
 * @return {string} pkg version
 */
function collectVersion(pkg, versions) {
    const pkgJson = readFileSync(path.resolve("node_modules", pkg, "package.json"), "utf8");
    const {version, dependencies = {}, peerDependencies = {}} = JSON.parse(pkgJson);
    Object.keys({...dependencies, ...peerDependencies}).forEach(subPkg => {
        if (versions[subPkg] === undefined) {
            versions[subPkg] = collectVersion(subPkg, versions)
        }
    })
    return version
}

/**
 * Get exported name of the module
 * @param id
 * @return {string}
 */
export function exportName(id) {
    return id.replace(/[-\/]/g, "_").toUpperCase()
}