const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Add:
Users can add their workout splits.
*/

module.exports = {
    cooldown: 3,
    category: 'workout',
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a workout split.'),
    async execute(interaction) {
        await interaction.reply({content: 'THIS IS TO ADD A WORKOUT SPLIT', flags: MessageFlags.Ephemeral});
    },
};