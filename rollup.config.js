import commonjs from '@rollup/plugin-commonjs';
import resolve from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import typescript from "@rollup/plugin-typescript";
import fs from 'fs/promises';
import postcss from 'rollup-plugin-postcss'

export default {
    input: "src/mwi/main.ts",
    output: {
        format: "iife",
        file: "dist/mwi.js",
        banner: async (_) => await fs.readFile("src/mwi/main.ts.banner", {encoding: 'utf-8'}),
    },
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