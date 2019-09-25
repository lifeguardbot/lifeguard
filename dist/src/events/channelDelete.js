"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Guild_1 = require("../models/Guild");
const Event_1 = require("./Event");
exports.event = new Event_1.Event("channelDelete", async (bot, channel) => {
    const lang = bot.langs["en-US"].events.channelDelete;
    try {
        const guild = await Guild_1.findGuild(channel.guild.id);
        const embed = new discord_js_1.RichEmbed({
            description: bot.format(lang.log, {
                id: channel.id,
                name: `#${channel.name}`
            })
        });
        embed.setTimestamp();
        if (guild) {
            const modlog = channel.guild.channels.get(guild.modLog);
            if (modlog) {
                modlog.send(embed);
            }
        }
    }
    catch (err) {
        return {
            location: "ChannelDelete Event",
            message: err
        };
    }
});
