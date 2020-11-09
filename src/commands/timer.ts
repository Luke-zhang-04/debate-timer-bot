/**
 * Discord Debate Timer
 * @copyright 2020 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.3.0
 * @license BSD-3-Clause
 */

import type {
    DMChannel,
    Guild,
    GuildMember,
    Message,
    NewsChannel,
    TextChannel,
    User
} from "discord.js"
import {adminRoleName, maxTimers} from "../getConfig"
import {formatTime, nextKey} from "./timerUtils"

type Channel = TextChannel | DMChannel | NewsChannel

type Timer = {
    id: number,
    uid: string,
    kill: (shouldmute: boolean)=> void,
    playPause: (playOrPause?: "play" | "pause")=> void,
}

type Timers = {[key: number]: Timer}

/**
 * Timers get pushed here
 * This keeps track of running timers
 * To kill a timer, the kill() function should be called
 */
const timers: Timers = {}

/**
 * How often the timer should update in seconds
 * 5 seconds is fine because of server latency
 * Anything smaller might cause issues
 */
const interval = 5

/**
 * Checks if a number is within a range
 * E.g `inRange(9, 10)` -> `true`
 *     `inRange(7, 10, 2)` -> `false`
 * @param actual - actual value of number
 * @param expected - expected value of number
 * @param margin - margin for error
 * @returns whether actual is within the margin of error against expected
 */
const inRange = (actual: number, expected: number, margin = 1): boolean => (
    actual >= expected - margin && actual <= expected + margin
)

/**
 * Sends a message to the channel to notify everyone that an important time
 * has passed, such as protected times
 * @param message - message object to send message to
 * @param time - current timer of timer
 * @param user - optional user - will ping if exists
 * @returns void
 */
const notifySpeechStatus = (
    channel: Channel,
    time: number,
    user?: string,
): void => {
    const userTag = user ? `<@${user}>` : ""

    if (inRange(time, 30)) {
        channel.send(`${userTag} **0:30** - Protected time is over!`)
    } else if (inRange(time, 150)) {
        channel.send(`${userTag} **2:30** - You're halfway through your speech!`)
    } else if (inRange(time, 270)) {
        channel.send(`${userTag} **4:30** - Protected time! Your speech is almost over!`)
    } else if (inRange(time, 300)) {
        channel.send(`${userTag} **5:00** - Your speech is over! You have 15 seconds of grace time.`)
    } else if (inRange(time, 315)) {
        channel.send(`${userTag} **5:15** - Your speech is over!`)
    }
}

/**
 * Mute a user for 1 second. To be called after 5:15
 * @param guild - guild object so we can get the user
 * @param user - user object so we can fetch the user
 * @returns void
 */
const muteUser = async (guild: Guild | null, user: User): Promise<void> => {
    const member = guild?.member(user) // Get user

    if (member?.voice.connection) {
        member?.voice.setMute(true, "Your speech is over") // Mute them

        await new Promise((resolve) => { // Wait one second
            setTimeout(() => resolve(), 2500)
        })

        member?.voice.setMute(false)
    }
}

const isauthorizedToModifyTimer = (
    author: GuildMember | null,
    timer: Timer,
): boolean => {
    if (author === null) { // No author
        return false
    }

    const isadmin =
        author.roles.cache.find((role) => role.name === adminRoleName) !== null

    return author.user.id === timer.uid || isadmin
}


/**
 * Pauses a timer with id
 * @param param0 - message object with message info
 * @param id - timer id - could be undefined, but shouldn't be
 * @returns void
 */
export const playPause = (
    {member, channel}: Message,
    id?: string,
    playOrPause?: "play" | "pause",
): void => {
    const numericId = Number(id)

    if (id === undefined) { // Id was never provided. Terminate.
        channel.send(":confused: Argument [id] not provided. For help using this command, run the `!help` command.")

        return
    } else if (isNaN(numericId)) { // Id couldn't be parsed as a number. Terminate.
        channel.send(`:1234: Could not parse \`${id}\` as a number. Learn to count.`)

        return
    }

    channel.send(`Looking for timer with id ${id}`)

    const timer = timers[numericId]

    if (timer === undefined) {
        channel.send(`:confused: Could not find timer with id ${id}`)
    } else if (isauthorizedToModifyTimer(member, timer)) {
        timer.playPause(playOrPause)

        channel.send(`${playOrPause === "pause" ? "Paused" : "Continuing"} timer with id ${id}`)
    } else {
        channel.send(`Sorry <@${member?.user.id}>, but you're not authorized to modify this protected timer. Only <@${timer.uid}> of the timer and those with the ${adminRoleName} role may modify this timer.`)
    }
}


/**
 * Kills a timer with id
 * @param param0 - message object with message info
 * @param id - timer id - could be undefined, but shouldn't be
 * @returns void
 */
export const kill = (
    {member, channel}: Message,
    id?: string,
    shouldmute?: boolean,
): void => {
    const numericId = Number(id)

    if (id === undefined) { // Id was never provided. Terminate.
        channel.send(":confused: Argument [id] not provided. For help using this command, run the `!help` command.")

        return
    } else if (isNaN(numericId)) { // Id couldn't be parsed as a number. Terminate.
        channel.send(`:1234: Could not parse \`${id}\` as a number. Learn to count.`)

        return
    }

    const num = Math.random()

    if (num < 0.5) {
        channel.send(`Looking for timer with id ${id}`)
    } else if (num < 0.75) {
        channel.send(`Sending hitman for timer with id ${id}`)
    } else {
        channel.send(`Destroying leftist "Timer ${id}" with FACTS and LOGIC`)
    }

    const timer = timers[numericId]

    if (timer === undefined) {
        channel.send(`:confused: Could not find timer with id ${id}`)
    } else if (isauthorizedToModifyTimer(member, timer)) {
        timer.kill(Boolean(shouldmute)) // Run the `kill()` function
        Reflect.deleteProperty(timers, numericId) // Delete timer after killing
    } else {
        channel.send(`Sorry <@${member?.user.id}>, but you're not authorized to modify this protected timer. Only <@${timer.uid}> of the timer and those with the ${adminRoleName} role may modify this timer.`)
    }
}

/**
 * Start a new timer in background
 * @param message - message object
 * @returns Promise<void>
 */
export const start = async (message: Message): Promise<void> => {
    if (Object.keys(timers).length >= maxTimers) { // Max number of timers reached
        message.channel.send(`A maximum of ${maxTimers} are allowed to run concurrently. Since this bot is hosted on either some crappy server or Luke's laptop, running too many concurrent tasks isn't a great idea. The max timer count can be changed in the configuration file.`)

        return
    }

    const user = message.mentions.users.first() // Mentioned user
    const uid = user?.id // Id of aforementioned user

    await message.channel.send(`:timer: Starting timer${uid ? ` for debater <@${uid}>` : ""}!`)

    let time = 0, // Delta time in seconds
        id: NodeJS.Timeout | null = null, // Interval id
        fakeId: number | undefined, // Number the user will see
        shouldmute = true, // If use should be muted after speech
        ispaused = false

    /**
     * Keep track of this message, as we're going to consantly edit it and
     * change it's time
     */
    const msg = await message.channel.send(`Current time: ${formatTime(time)}`)

    /**
     * The starttime of this timer
     * This is important because setInterval() is unreliable, and can lag
     * behind at any time if it wants
     */
    let startTime = Date.now()

    // Wait for timer to resolve with a Promise :)
    await new Promise((resolve) => {
        id = setInterval(() => { // Set the id of this interval
            // Subtract current time from start time and round to nearest second
            time = ispaused ? time : Math.round((Date.now() - startTime) / 1000)

            if (ispaused) {
                startTime += 5000
            }

            msg.edit(`Current time: ${formatTime(time)}\nId: ${fakeId ?? "unknown"}${ispaused ? "\nPaused" : ""}`)

            notifySpeechStatus(message.channel, time, uid)

            // If speech surpasses 320 seconds (5 minutes 20 seconds)
            if (time >= 320 || time > 900) {
                if (id !== null) {
                    clearInterval(id) // Clear interval
                }

                if (time > 900) {
                    shouldmute = false
                    message.channel.send(`Timer with id ${id} has been paused or running for more than 15 minutes. This timer is now being killed.`)
                }

                return resolve() // Resolve promise
            }

            return undefined
        }, interval * 1000)

        fakeId = nextKey(Object.keys(timers).map((num) => Number(num)))

        // Show timer id ASAP
        msg.edit(`Current time: ${formatTime(time)}\nId: ${fakeId ?? "unknown"}`)

        // Push the id and kill function to the timers array
        timers[fakeId] = {
            id: Number(`${id}`),
            uid: message.author.id,
            // This function is for killing the timer
            kill: (shouldmuteUser: boolean): void => {
                clearInterval(Number(`${id}`))

                shouldmute = shouldmuteUser

                message.channel.send(`Killed timer with id ${fakeId}.`)
                resolve()
            },
            // This function is for playing or pausing
            playPause: (playOrPause?: "play" | "pause"): void => {
                ispaused = playOrPause === undefined
                    ? !ispaused
                    : playOrPause === "pause"
            },
        }
    })

    msg.edit(`:white_check_mark: Speech Finished!`)

    if (user !== undefined && shouldmute) {
        muteUser(message.guild, user)
    }

    if (fakeId !== undefined) {
        Reflect.deleteProperty(timers, fakeId)
    }
}

export default {
    kill,
    start,
    playPause,
}
