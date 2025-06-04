const { User, Lift } = require('../../models')
const { SlashCommandBuilder } = require('discord.js');

/*
Max:
Users can track maxes for compound lifts (bench, squat, deadlift).
*/

async function logLift(discordId, username, liftName, weight) {
    await User.upsert({ discordId, username });

    // Save storage by updating entries rather than creating new ones every time
    const existingLift = await Lift.findOne({
        where: { discordId, liftName }
    });

    if (existingLift) {
        existingLift.weight = weight;
        existingLift.dateLogged = new Date();
        await existingLift.save();
    } else {
        await Lift.create({
            discordId,
            liftName,
            weight
        });
    }

    return `${username} has set a new ${liftName} max of ${weight} lbs!`;
};

module.exports = {
    cooldown: 3,
    category: 'progress',
    data: new SlashCommandBuilder()
        .setName('max')
        .setDescription('Set new max.')
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
            )
        .addIntegerOption(option =>
            option
                .setName('weight')
                .setDescription('Weight lifted (lbs).')
                .setRequired(true)
            ),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const username = interaction.user.username;
        const liftName = interaction.options.getString('lift');
        const weight = interaction.options.getInteger('weight');

        try {
            const message = await logLift(discordId, username, liftName, weight);
            return interaction.reply(message);
        } catch (error) {
			return interaction.reply('Something went wrong with tracking the lift.');
        }
    },
};