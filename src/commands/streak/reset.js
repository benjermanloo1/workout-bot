const { Streak } = require('../../models')
const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

/*
Reset:
Solely for debugging purposes.
*/

async function resetStreak(discordId, username) {
    const streak = await Streak.findOne({
        where: { discordId }
    });

    if (!streak) {
        return `${username} does not have a streak to reset.`;
    }
    
    streak.day = 0;
    streak.lastLogin = null;
    await streak.save();

    return `❌ ${username}'s streak has been reset. ❌`;
};

module.exports = {
    cooldown: 3,
    category: 'streak',
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Resets streak.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const username = interaction.user.username;

        try {
            const message = await resetStreak(discordId, username);
            await interaction.reply({content: message, flags: MessageFlags.Ephemeral});

        } catch (error) {
            await interaction.reply({ content: 'Something went wrong with resetting the streak.', flags: MessageFlags.Ephemeral });
            // await interaction.reply(error);
        }
    },
};