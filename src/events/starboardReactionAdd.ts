import { Event } from '@events/Event';
import { GuildStructure } from '@structures/GuildStructure';
import { defaultEmbed } from '@util/DefaultEmbed';
import { TextChannel, MessageReaction } from 'discord.js';

export const event = new Event(
  'starboardReactionAdd',
  async (lifeguard, reaction: MessageReaction) => {
    const dbGuild = await (reaction.message.guild as GuildStructure).db;
    if (dbGuild?.config.starboard && dbGuild.config.channels?.starboard) {
      const starboardChannel = reaction.message.guild?.channels.get(
        dbGuild.config.channels.starboard
      ) as TextChannel;
      const starboard = dbGuild.config.starboard;
      if (
        starboardChannel &&
        !starboard.ignoredChannels.includes(reaction.message.channel.id)
      ) {
        if (reaction.count ?? 0 >= starboard.minCount) {
          const starboardMessage = starboard.messages.find(
            m => m.id === reaction.message.id
          );
          if (starboardMessage) {
            const starboardMessageInChannel = starboardChannel.messages.get(
              starboardMessage.starboardID
            );
            starboardMessage.count = reaction.count ?? starboardMessage.count;
            const embed = defaultEmbed()
              .setAuthor(
                starboardMessageInChannel?.author.tag,
                starboardMessageInChannel?.author.avatarURL() ?? ''
              )
              .setDescription(reaction.message.content);
            starboardMessageInChannel?.edit(
              `${starboard.emoji} ${reaction.count} ${reaction.message.channel} (${reaction.message.id})`,
              embed
            );
          } else {
            const embed = defaultEmbed()
              .setAuthor(
                reaction.message.author.tag,
                reaction.message.author.avatarURL() ?? ''
              )
              .setDescription(reaction.message.content);
            const starboardMessage = await starboardChannel.send(
              `${starboard.emoji} ${reaction.count} ${reaction.message.channel} (${reaction.message.id})`,
              embed
            );
            starboard.messages.push({
              id: reaction.message.id,
              starboardID: starboardMessage.id,
              content: reaction.message.content,
              count: reaction.count ?? 0,
            });
          }
          await lifeguard.db.guilds.updateOne(
            { id: dbGuild.id },
            { $set: { 'config.starboard': starboard } }
          );
        }
      }
    }
  }
);
