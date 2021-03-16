/**
 * Discord Debate Timer
 * @copyright 2020 - 2021 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.6.1
 * @license BSD-3-Clause
 */

import {
    Message,
    User
} from "discord.js"
import {formatTime} from "./utils"

/**
 * Lists timers and prints them to message.channel
 * @param param0 - message object to send to
 * @param user - user for looking for timers
 * @returns void - sends message in function
 */
const listTimers = async ({channel}: Message, user?: User): Promise<void> => {
    // Get all the timers
    const timers = Object.values((await import(".")).timers)
        .filter((timer, index) => (
            index <= 10 && (
                user === undefined ||
                    user.id === timer.creator.id ||
                    user.id === timer.mentionedUid
            )
        ))

    // Format each timer to a string
    const timersString = timers.map((timer, index) => (
        `**${index + 1}**. Id: \`${timer.fakeId}\`, Created by: \`${timer.creator.username}\`, State: \`${timer.isPaused ? "paused" : "running"}\`, Time: \`${formatTime(timer.time)}\``
    ))

    // Message title/header
    const title = `${user?.id && `<@${user.id}>` || "global"}`

    channel.send(`**Timers for: ${title}**:\n${timersString.join("\n") || "None"}`)
}

/**
 * Lists timers
 * @param message - Discord message
 * @returns void - sends message in function
 */
export const list = (message: Message): Promise<void> => {
    const param = message.content.split(" ")[1]

    return listTimers(message, param === "global" ? undefined : message.author)
}

export default list