/**
 * Discord Debate Timer
 * @copyright 2020 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.4.2
 * @license BSD-3-Clause
 * @file lets you send messages on the bots behalf
 */

import type {Channels} from ".."
import Discord from "discord.js"

/**
 * Change "directory" as in a server, category, or channel
 * @param client - discord client
 * @param channels - array of current channels
 * @param newDir - new Dir that was passed in
 */
export const cd = (
    client: Discord.Client,
    channels: Channels,
    newDir: string,
): void => {
    const dirs = newDir.split("/")

    if (dirs[dirs.length - 1] === "") {
        dirs.pop()
    }

    for (const dir of dirs) {
        if (dir === "..") {
            channels.pop()
        } else if (dir === "") {
            channels.length = 0
        } else if (dir !== ".") {
            if (channels.length === 0) {
                const target = client.guilds.cache
                    .find((guild) => guild.name === dir || guild.id === dir)

                if (target === undefined) {
                    return console.log(`cd: "${dir}" no such server`)
                }

                channels.push(target)
            } else if (channels.length === 1) {
                const target = channels[0]?.channels.cache
                    .find((channel) => (
                        (channel.name === dir || channel.id === dir) && (
                            channel instanceof Discord.CategoryChannel ||
                            channel instanceof Discord.TextChannel &&
                                channel.parent === null
                        )
                    )) as Discord.CategoryChannel | Discord.TextChannel

                if (target === undefined) {
                    return console.log(`cd: "${dir}" no such category or text channel`)
                }

                channels.push(target)
            } else if (
                channels[1] instanceof Discord.CategoryChannel &&
                channels.length < 3
            ) {
                const target = channels[0]?.channels.cache
                    .find((channel) => (
                        channel.parent?.name ===
                            (channels[1] as Discord.CategoryChannel).name &&
                        (channel.name === dir || channel.id === dir) &&
                        channel instanceof Discord.TextChannel
                    )) as Discord.TextChannel

                if (target === undefined) {
                    return console.log(`cd: "${dir}" no such text channel`)
                }

                channels.push(target)
            } else if (
                channels[1] instanceof Discord.TextChannel ||
                channels.length >= 3
            ) {
                return console.log("This is a text channel. Did you mean to go back with \"..\"")
            }
        }
    }
}
