/**
 * Discord Debate Timer
 * @copyright 2020 - 2021 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.7.0
 * @license BSD-3-Clause
 */

import {adminRoleName, verbosity} from "../../getConfig"
import {deriveTimerId, derivedIdIsValid, isAuthorizedToModifyTimer} from "./utils"
import type {Message} from "discord.js"
import {timers} from "."

const makeChange = (
    timer: import(".").Timer,
    message: Message,
    numericId: number,
    numericAmt: number,
): void => {
    if (verbosity === 1) {
        message.react("\u2705")
    } else if (verbosity === 2) {
        if (numericAmt > 0) {
            message.channel.send(`Winding timer ${numericId} forward by ${numericAmt} seconds`)
        } else {
            message.channel.send(`Winding timer ${numericId} backwards by ${-numericAmt} seconds`)
        }
    }

    timer.changeTime(numericAmt)
}

/**
 * Changes the time of a timer with id
 * @param param0 - message object with message info
 * @param id - id of timer - could be undefined, but shouldn't be
 * @param amt - the amount to change the timer - could be undefined, but shouldn't be
 * @returns void
 */
export const changeTime = (
    message: Message,
    multiply: -1 | 1,
    id?: string,
    amt?: string,
): void => {
    const {author, member, channel} = message
    let numericId = Number(id)
    let numericAmt = Number(amt) * multiply

    if (id === undefined) {
        // Id was never provided. Terminate.
        channel.send(
            ":confused: Argument [id] not provided. For help using this command, run the `!help` command.",
        )

        return
    } else if (isNaN(numericId)) {
        // Id couldn't be parsed as a number. Terminate.
        channel.send(`:1234: Could not parse \`${id}\` as a number. Learn to count.`)

        return
    }

    if (amt === undefined) {
        const derivedId = deriveTimerId(timers, author.id)
        const derivedNumericId = Number(derivedId)

        if (!derivedIdIsValid(derivedId, derivedNumericId, message)) {
            return
        }

        numericAmt = numericId * multiply
        numericId = derivedNumericId
    } else if (isNaN(numericAmt)) {
        // Id couldn't be parsed as a number. Terminate.
        channel.send(`:1234: Could not parse \`${amt}\` as a number. Learn to count.`)

        return
    }

    if (verbosity === 2 && numericAmt === 0) {
        channel.send(":1234: Changing the timer by 0 does nothing. Learn to add.")

        return
    }

    // The current timer
    const timer = timers[numericId]

    if (timer === undefined) {
        channel.send(`:confused: Could not find timer with id ${id}`)
    } else if (isAuthorizedToModifyTimer(member, author, timer)) {
        makeChange(timer, message, numericId, numericAmt)
    } else {
        const mentionedMessage = timer.mentionedUid
            ? `, the mentioned user (${timer.mentionedUid}),`
            : ""

        channel.send(
            `Sorry <@${
                author.id
            }>, but you're not authorized to modify this protected timer. Only the timer creator (${
                timer.creator.username
            })${mentionedMessage} and those with the \`${adminRoleName.value}\` ${
                adminRoleName.type === "name" ? "role" : "permission"
            } may modify this timer.`,
        )
    }
}

/**
 * Change the time of a timer
 * @param message - message object
 * @param mode - positive to decrease time, negative to increase
 */
export default (message: Message, mode: -1 | 1): void => {
    const content = message.content.split(" ")

    changeTime(message, mode, content[1], content[2])
}
