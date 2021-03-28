/**
 * Discord Debate Timer
 * @copyright 2020 - 2021 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.7.0
 * @license BSD-3-Clause
 */

declare namespace NodeJS {
    interface ProcessEnv {
        AUTHTOKEN: string // Authentication Token
        APIKEY: string // Google sheets API key
    }
}
