const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Leaderboard:
Users can see who has the highest singular max lift / combined max lifts.
*/



module.exports = {
    cooldown: 3,
    category: 'progress',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the leaderboard.'),
    async execute(interaction) {
        await interaction.reply('LEADERBOARD FLFLAFLAFLFLF');
    },
};