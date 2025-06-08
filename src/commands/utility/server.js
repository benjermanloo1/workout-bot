const { Streak, User } = require('../../models')
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
        const listUsers = await User.findAll();

        const streaks = await Promise.all(
            listUsers.map(user => Streak.findOne({ where: { discordId: user.discordId } }))
        );

        const total = streaks.reduce((sum, streak) => sum + (streak?.day || 0), 0);

        const members = listUsers.length === 1 ? 'member' : 'members';
        await interaction.reply(`😎  ${interaction.guild.name} has ${listUsers.length} active ${members} and ${total} total streak days  😎`);
    },
};