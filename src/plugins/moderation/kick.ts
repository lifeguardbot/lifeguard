import { UserInfraction } from '@models/User';
import { Command } from '@plugins/Command';
import { parseUser } from '@util/parseUser';

export const command = new Command(
  'kick',
  async (lifeguard, msg, [uid, ...reason]) => {
    // Parse user id from mention
    const u = parseUser(uid);
    try {
      // Create Infraction
      const inf: UserInfraction = {
        action: 'Kick',
        active: true,
        guild: msg.guild?.id as string,
        id: (await lifeguard.db.users.findOne({ id: u }))?.infractions
          .length as number,
        moderator: msg.author.id,
        reason: reason.join(' '),
        time: new Date(),
      };

      // Update User in Database
      await lifeguard.db.users.findOneAndUpdate(
        { id: u },
        { $push: { infractions: inf } },
        { returnOriginal: false }
      );

      // Get User
      const member = await msg.guild?.members.get(u);
      // Notify User about Action
      member?.send(
        `You have been kicked from **${msg.guild?.name}** for \`${reason.join(
          ' '
        )}\``
      );
      // Ban the User
      member?.kick(reason.join(' '));

      // Tell moderator action was successful
      msg.channel.send(
        `${member?.user.tag} was kicked by ${msg.author.tag} for \`${
          reason.length > 0 ? reason.join(' ') : 'No Reason Specified'
        }\``
      );
    } catch (err) {
      msg.channel.send(err.message);
    }
  },
  {
    level: 1,
    usage: ['kick {user} [reason]'],
  }
);
