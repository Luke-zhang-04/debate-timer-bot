import alias from "@rollup/plugin-alias"
import progress from "rollup-plugin-progress"
import replace from "@rollup/plugin-replace"
import resolve from "@rollup/plugin-node-resolve"
import {terser} from "rollup-plugin-terser"
import typescript from "@rollup/plugin-typescript"

const banner = `#!/bin/node
/**
 * Discord Debate Timer
 * @copyright 2020 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.6.1
 * @license BSD-3-Clause
 * @preserve
 */

`

/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
    input: "src/index.ts",
    output: {
        file: "./bot.mjs",
        format: "esm",
        banner,
    },
    plugins: [
        progress(),
        alias({
            entries: [
                {
                    find: "@luke-zhang-04/dateplus/dist/cjs/dateplus.cjs",
                    replacement: "@luke-zhang-04/dateplus",
                },
            ],
        }),
        typescript({
            tsconfig: "./tsconfig.rollup.json",
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "prod"),
        }),
        resolve({
            resolveOnly: [/^\.{0,2}\/|tslib/],
        }),
        process.env.NODE_ENV === "dev" ? undefined : terser({
            format: {
                comments: (_, {value}) => (
                    (!(/Luke Zhang/ui).test(value) || (/@preserve/ui).test(value)) &&
                    (/@preserve|li[cs]ense|copyright/ui).test(value)
                ),
            }
        }),
    ]
}

export default config
