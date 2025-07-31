import commonjs from '@rollup/plugin-commonjs';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import html from "@rollup/plugin-html";
import json from "@rollup/plugin-json";
import resolvePlugin from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import typescript from "@rollup/plugin-typescript";
import {defineConfig} from 'rollup';
import postcss from 'rollup-plugin-postcss'
import sizes from 'rollup-plugin-sizes'
import {isProduction} from "../shared/build-utils.js";

export default defineConfig({
    input: [
        "src/grid-trading/main.ts",
    ],
    output: {
        format: "esm",
        dir: "dist/grid-trading",
    },
    plugins: [
        // Added for React
        commonjs(),
        resolvePlugin(),
        replace({
            'process.env.NODE_ENV': JSON.stringify(isProduction ? "production" : "development"),
            '__platform__': JSON.stringify("browser"),
            preventAssignment: true,
        }),
        typescript(),
        postcss(),
        sizes(),
        json(),
        dynamicImportVars(),
        html({
            title: "Grid Trading",
        })
    ],
})
