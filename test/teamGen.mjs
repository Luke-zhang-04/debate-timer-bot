/**
 * Discord Debate Timer
 * @copyright 2020 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @license MIT
 */
import {Message} from "./utils/mockDiscord.mjs"
import handleMessage from "../lib/handleMessage.js"
import testHelpers from "./utils/helpers.mjs"

export default () => {
    it("Should toss random teams", () => {
        const message = new Message("!makeTeams")

        handleMessage.default(message)

        const returnMsg = message.newMessage.content

        testHelpers.includes(returnMsg, "**OG**:")
        testHelpers.includes(returnMsg, "**CO**:")
        testHelpers.includes(returnMsg, "Team-B")
        testHelpers.includes(returnMsg, "Team-C")
    })

    it("Should toss random partners", () => {
        const message = new Message("!makePartners a b c d e f g h")

        handleMessage.default(message)

        const returnMsg = message.newMessage.content

        testHelpers.includes(returnMsg, "**Team-B**:")
        testHelpers.includes(returnMsg, "**Team-C**:")
        testHelpers.includesOneof(returnMsg, ": a", ", a")
        testHelpers.includesOneof(returnMsg, ": b", ", b")
    })
}