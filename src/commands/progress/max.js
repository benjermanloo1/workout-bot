const { SlashCommandBuilder } = require('discord.js');

/*
Max:
Users can track maxes for compound lifts (bench, squat, deadlift).
Option to record in either lbs or kg.
*/

module.exports = {
    cooldown: 3,
    category: 'progress',
    data: new SlashCommandBuilder()
        .setName('max')
        .setDescription('Set new max.'),
    async execute(interaction) {
        // add option for bench, squat, deadlift
        // add option for lbs, kg
        await interaction.reply('THIS WILL ALLOW USERS TO TRACK THEIR MAXES');
    },
};