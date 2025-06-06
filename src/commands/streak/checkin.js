const { Streak, User } = require('../../models')
const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Check-in:
Users can keep track of a daily streak.
Streak will only be incremented when 'workout' is selected, but will not be lost on 'rest'.
Reset every midnight (12:00 AM EST).
*/

async function incrementStreak(discordId, username) {
    await User.upsert({discordId, username});

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const streak = await Streak.findOne({
        where: { discordId }
    });

    if (streak) {
        const last = new Date(streak.lastLogin);
        const lastStr = last.toISOString().split('T')[0];

        const ms = 1000 * 60 * 60 * 24;
        const diffDays = Math.floor((today - last) / ms);

        if (todayStr === lastStr) {
            return `🤓  ${username}, you've already checked in today!  🤓`
        } else if (diffDays === 1) {
            streak.day += 1;
        } else {
            streak.day = 1;
        }

        streak.lastLogin = today;
        await streak.save();
    } else {
        await Streak.create({
            discordId,
            day: 1,
            lastLogin: today,
        });
    }
    
    return `🔥 ${username} has just checked in. They are on a ${streak.day}-day streak! 🔥`;
};

async function rest(discordId, username) {
    await User.upsert({discordId, username});

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const streak = await Streak.findOne({
        where: { discordId }
    });

    if (streak) {
        const last = new Date(streak.lastLogin);
        const lastStr = last.toISOString().split('T')[0];

        if (todayStr === lastStr) {
            return `🤓  ${username}, you've already checked in today!  🤓`
        }

        streak.lastLogin = today;
        await streak.save();
    } else {
        await Streak.create({
            discordId,
            day: 0,
            lastLogin: today,
        });
    }
    
    return `💤 ${username} is resting today. 💤`;
};

module.exports = {
    cooldown: 3,
    category: 'streak',
    data: new SlashCommandBuilder()
        .setName('checkin')
        .setDescription('Daily check-in.')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of check-in.')
                .setRequired(true)
                .addChoices(
                    { name: 'workout', value: 'workout' },
                    { name: 'rest', value: 'rest' },
                )
            ),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const username = interaction.user.username;
        const type = interaction.options.getString('type');

        try {
            if (type === 'workout') {
                const message = await incrementStreak(discordId, username);

                const repeat = message.includes('already checked in');

                if (repeat) {
                    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral});
                } else {
                    await interaction.reply(message);
                }
            } else {
                const message = await rest(discordId, username);

                const repeat = message.includes('already checked in');

                if (repeat) {
                    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral});
                } else {
                    await interaction.reply(message);
                }
            }
        } catch (error) {
            return interaction.reply({ content: 'Something went wrong with checking in.', flags: MessageFlags.Ephemeral })
            // return interaction.reply(`${error}`)
        }
    },
};