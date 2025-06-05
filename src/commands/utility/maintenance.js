const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Maintenance:
User provides info through boxes (age, weight, height, activity level, sex)
Rough estimation of maintenance calories
*/

async function calculateMaintenance(age, weight, height, activityLevel, sex) {
    const base = sex === 'male' ? 5 : -161

    const bmr = base + (10 * weight) + (6.25 * height) - (5 * age);

    const maintenanceCalories = Math.round(bmr * activityLevel);

    return `Your maintenance is around ${maintenanceCalories} calories a day.`
};

module.exports = {
    cooldown: 3,
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('maintenance')
        .setDescription('Calculate maintenance calories.')
        .addIntegerOption(option => 
            option
                .setName('age')
                .setDescription('Age of user.')
                .setRequired(true)
            )
        .addIntegerOption(option => 
            option
                .setName('weight')
                .setDescription('Weight of user (lbs).')
                .setRequired(true)
            )
        .addIntegerOption(option => 
            option
                .setName('height')
                .setDescription('Height of user (in).')
                .setRequired(true)
            )
        .addNumberOption(option => 
            option
                .setName('activity_level')
                .setDescription('Activity level of user.')
                .setRequired(true)
                .addChoices(
                    { name: 'sedentary (office job)', value: 1.2 },
                    { name: 'light exercise (1-2 days/week)', value: 1.375 },
                    { name: 'moderate exercise (3-5 days/week)', value: 1.55 },
                    { name: 'heavy exercise (6-7 days/week)', value: 1.725 },
                    { name: 'athlete (2x per day)', value: 1.9 },
                )
            )
        .addStringOption(option => 
            option
                .setName('sex')
                .setDescription('Sex of user.')
                .setRequired(true)
                .addChoices(
                    { name: 'male', value: 'male' },
                    { name: 'female', value: 'female' },
                )
            ),
    async execute(interaction) {
        const age = interaction.options.getInteger('age');
        const weight = interaction.options.getInteger('weight') / 2.205;
        const height = interaction.options.getInteger('height') * 2.54 ;
        const activityLevel = interaction.options.getNumber('activity_level');
        const sex = interaction.options.getString('sex');

        const message = await calculateMaintenance(age, weight, height, activityLevel, sex);

        await interaction.reply({content: message, flags: MessageFlags.Ephemeral});
    },
};