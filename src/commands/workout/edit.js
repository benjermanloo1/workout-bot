const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Edit:
Users can edit their workout splits.
*/

module.exports = {
    cooldown: 3,
    category: 'workout',
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edit a workout split.'),
    async execute(interaction) {
        await interaction.reply({content: 'THIS IS TO EDIT A WORKOUT SPLIT.', flags: MessageFlags.Ephemeral});
    },
};