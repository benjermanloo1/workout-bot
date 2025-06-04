const { User, Streak } = require('../../models')
const { SlashCommandBuilder } = require('discord.js');

/*
Check-in:
Users can keep track of a daily streak.
Streak will only be incremented when 'workout' is selected, but will not be lost on 'rest'.
Reset every midnight (12:00 AM EST).
*/

async function incrementStreak(discordId, username) {
    await User.upsert({discordId, username});

    
    
    return `${interaction.user.username} has just checked in. They are on a --- day streak!`;
};

async function resetStreak () {
    return 'poop';
}

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
                await interaction.reply(message);
            } else {
                const message = 'test';
                await interaction.reply(`${interaction.user.username} is resting today.`);
            }
        } catch (error) {
            return interaction.reply('Something went wrong with checking in.')
        }
    },
};