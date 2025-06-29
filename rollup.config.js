import commonjs from '@rollup/plugin-commonjs';
import resolve from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import typescript from "@rollup/plugin-typescript";
import fs from 'fs/promises';
import postcss from 'rollup-plugin-postcss'

function esmGlobals(id) {
    if (process.env.NODE_ENV === "production") {
        // jsdelivr is faster
        return `await import('https://cdn.jsdelivr.net/npm/${id}/+esm')`
    } else {
        return `await import('https://esm.sh/${id}?dev')`
    }
}

export default {
    input: "src/mwi/main.ts",
    output: {
        format: "iife",
        file: "dist/mwi.js",
        banner: async (_) => await fs.readFile("src/mwi/main.ts.banner", {encoding: 'utf-8'}),
        globals: {
            "react": esmGlobals("react@19.1.0"),
            "react-dom/client": esmGlobals("react-dom@19.1.0/client"),
        },
    },
    external: ["react", "react-dom/client"],
    plugins: [
        // Added for React
        commonjs(),
        resolve(),
        replace({
            // Added for React
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            '__dev_mode__': process.env.NODE_ENV === "production" ? "" : "Dev",
            '__commit__': process.env.VERSION_COMMIT ?? "dev",
            preventAssignment: true,
        }),
        typescript(),
        postcss(),
    ],
}