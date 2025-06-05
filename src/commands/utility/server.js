const { User } = require('../../models')
const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Server:
Display number of users and combined streak days.
*/

module.exports = {
    cooldown: 3,
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    async execute(interaction) {
        await interaction.reply({ content: `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`, flags: MessageFlags.Ephemeral });
    },
};