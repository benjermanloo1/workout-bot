const { SlashCommandBuilder } = require('discord.js');

/*
Check-in:
Users can keep track of a daily streak.
Streak will only be incremented when 'workout' is selected, but will not be lost on 'rest'.
Reset every midnight (12:00 AM EST).
*/

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
                )),
    async execute(interaction) {
        if (interaction.options.getString('type') == 'workout') {
            await interaction.reply(`${interaction.user.username} has just checked in. They are on a --- day streak!`);
        } else {
            await interaction.reply(`${interaction.user.username} is resting today.`);
        }
    },
};