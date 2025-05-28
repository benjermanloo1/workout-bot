const { SlashCommandBuilder, MessageFlags } = require('discord.js');

/*
Maintenance - 
User provides info through boxes (height, weight, activity level, sex, age)
Rough estimation of maintenance calories
*/

module.exports = {
    cooldown: 3,
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('maintenance')
        .setDescription('Calculate maintenance calories.'),
    async execute(interaction) {
        // add options of height, weight, activity level, sex, age
        await interaction.reply({content: 'THIS WILL BE THE MAINTENANCE CALCULATOR', flags: MessageFlags.Ephemeral});
    },
};