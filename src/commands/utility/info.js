const { SlashCommandBuilder } = require('discord.js');

/*
Info - 
Provide name, streak, current maxes, etc.
Able to look at other users information, unless private.
*/

module.exports = {
    cooldown: 3,
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about a user in the server.'),
    async execute(interaction) {
        // add option to select user in server
        await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
    },
};