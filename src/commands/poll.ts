/**
 * Discord Debate Timer
 * @copyright 2020 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.2.0
 * @license BSD-3-Clause
 */

import type {
    Client,
    DMChannel,
    Message,
    NewsChannel,
    TextChannel
} from "discord.js"
import {emojis} from "../getConfig"

const emoji1 = emojis.debating.id ? `<:${emojis.debating.name}:${emojis.debating.id}>` : `:${emojis.debating.name}:`
const emoji2 = emojis.spectating.id ? `<:${emojis.spectating.name}:${emojis.spectating.id}>` : `:${emojis.spectating.name}:`

type Channel = TextChannel | DMChannel | NewsChannel

const debaters: string[] = []
const spectators: string[] = []

export const makePoll = async (
    message: Message,
    client: Client,
): Promise<void> => {
    const msg = await message.channel.send(`**Starting a poll**\nReact here for your choice of participation today. Debating spots are first come first serve.\n\nDebateur: ${emoji1}\nSpectateur: ${emoji2}`)

    debaters.length = 0
    spectators.length = 0

    client.on("messageReactionAdd", async (reaction) => {
        if (reaction.message.id === msg.id) {
            const reacted = await reaction.fetch()

            if (reacted.emoji.name === emojis.debating.name) {
                if (debaters.length >= 8) {
                    message.channel.send("Sorry, there are already 8 debaters.")
                } else {
                    debaters.length = 0

                    for (const [uid] of reacted.users.cache) {
                        debaters.push(uid)
                    }
                }
            } else if (reacted.emoji.name === emojis.spectating.name) {
                spectators.length = 0

                for (const [uid] of reacted.users.cache) {
                    spectators.push(uid)
                }
            }
        }
    })
}

export const getPoll = (channel: Channel): void => {
    let debatersString = "",
        spectatorsString = ""

    for (const debater of debaters) {
        debatersString += `<@${debater}> `
    }

    for (const spectator of spectators) {
        spectatorsString += `<@${spectator}> `
    }

    channel.send(`Debaters: ${debatersString}\nSpectators: ${spectatorsString}`)
}

export default {
    makePoll,
    getPoll,
}