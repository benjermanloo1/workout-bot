const { Lift } = require('../../models')
const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Delete Max:
Solely for debugging purposes.
*/

async function deleteMax(discordId, liftName) {
    const lift = Lift.findOne({
        where: {
            discordId,
            liftName
        },
    });

    if (!lift) {
        return `You do not have a ${liftName} max recorded.`;
    } else {
        await Lift.destroy({
            where: {
                discordId,
                liftName,
            },
        });

        return `❌  Successfully deleted.  ❌`;
    }
};

module.exports = {
    cooldown: 3,
    category: 'progress',
    data: new SlashCommandBuilder()
        .setName('delete-max')
        .setDescription('Delete a max.')
        .addStringOption(option => 
            option
                .setName('lift')
                .setDescription('Lift performed.')
                .setRequired(true)
                .addChoices(
                    { name: 'bench press', value: 'bench' },
                    { name: 'squat', value: 'squat' },
                    { name: 'deadlift', value: 'deadlift' },
                )
            ),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const liftName = interaction.options.getString('lift');

        const message = await deleteMax(discordId, liftName);

        await interaction.reply({content: message, flags: MessageFlags.Ephemeral});
    },
};