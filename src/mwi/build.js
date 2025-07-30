import commonjs from '@rollup/plugin-commonjs';
import resolvePlugin from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import typescript from "@rollup/plugin-typescript";
import {readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {rollup} from 'rollup';
import postcss from 'rollup-plugin-postcss'
import sizes from 'rollup-plugin-sizes'
import {exportName, isProduction, resolveCdnUrl} from "../shared/build-utils.js";

/*
The goal of this workflow is as follows:
- Set up the ws-hook code, the code must be sync code to make sure the websocket is hooked
- Dynamic import the large dependencies
- Run the rest of the code

Base on the above, the workflow is as follows:
- Build esm for ws-hook and main, and the shared chunk named shared.js
- Build umd for shared.js and loaded first. It's sync code.
- Build iife for ws-hook and loaded second. It's sync code.
- Build iife for main and loaded last. The main code is around with dynamic import, so it's async code.
 */

/**
 * Add external modules for cdn
 */
const external = ['react', 'react-dom', 'react-dom/client', 'recharts']

const esmBundle = await rollup({
    input: [
        "src/mwi/ws-hook.ts",
        "src/mwi/main.ts"
    ],
    external,
    plugins: [
        // Added for React
        commonjs(),
        resolvePlugin(),
        replace({
            'process.env.NODE_ENV': JSON.stringify(isProduction ? "production" : "development"),
            '__platform__': JSON.stringify("tampermonkey"),
            preventAssignment: true,
        }),
        typescript(),
        postcss(),
        sizes(),
    ],
})
await esmBundle.write({
    format: "esm",
    dir: "dist/mwi",
    chunkFileNames: "shared.js",
})

// UMD for shared
await (await rollup({input: "dist/mwi/shared.js"})).write({
    format: "umd",
    file: "dist/mwi/shared.umd.js",
    name: "MWI_SHARED",
})

// IIFE for ws-hook
await (await rollup({input: "dist/mwi/ws-hook.js", external: ["./shared.js"]})).write({
    format: "iife",
    file: "dist/mwi/ws-hook.iife.js",
    globals: {[path.resolve("dist/mwi/shared.js")]: "MWI_SHARED"}
})


const dynamicImports = external.map((id) => `const ${exportName(id)} = await import ('${resolveCdnUrl(id)}');`).join("\n");

// IIFE for main with dynamic import around
await (await rollup({input: "dist/mwi/main.js", external: ["./shared.js", ...external]})).write({
    format: "iife",
    file: "dist/mwi/main.iife.js",
    name: "MwiMain",
    banner: "async function main() {\n" + dynamicImports + "\n",
    footer: "}\nmain();",
    globals: {
        [path.resolve("dist/mwi/shared.js")]: "MWI_SHARED",
        ...Object.fromEntries(external.map((id) => [id, exportName(id)])),
    },
})

// Concat the files, also add banner
writeFileSync("dist/mwi.js", [
    readFileSync("src/mwi/main.ts.banner", {encoding: 'utf-8'})
        .replace(/__commit__/g, process.env.VERSION_COMMIT ?? "dev")
        .replace(/__dev_mode__/g, isProduction ? "" : "Dev"),
    readFileSync("dist/mwi/shared.umd.js", {encoding: 'utf-8'}),
    readFileSync("dist/mwi/ws-hook.iife.js", {encoding: 'utf-8'}),
    readFileSync("dist/mwi/main.iife.js", {encoding: 'utf-8'})
].join("\n"), {encoding: 'utf-8'})

