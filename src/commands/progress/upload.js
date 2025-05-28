const { SlashCommandBuilder, MessageFlags } = require('discord.js');

/*
Upload:
Users can upload progress pictures.
(potentially) Store in gallery with timestamps of original upload.
*/

module.exports = {
    cooldown: 3,
    category: 'progress',
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Upload a progress picture.'),
    async execute(interaction) {
        await interaction.reply({content: 'THIS WILL UPLOAD A PROGRESS PICTURE', flags: MessageFlags.Ephemeral});
    },
};