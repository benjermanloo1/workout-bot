const { Workout } = require('../../models')
const { MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder  } = require('discord.js');

/*
Edit:
Users can delete their workout splits.
*/

async function displayInformation(discordId, interaction) {
    let workoutSelect = new StringSelectMenuBuilder();
};


async function getWorkouts(discordId) {
    const workouts = await Workout.findAll({
            where: {discordId},
        });

    const workoutNames = workouts.map(workout => workout.workoutName);
    const menuOptions = workoutNames.map(workout => 
        new StringSelectMenuOptionBuilder()
            .setLabel(workout.toUpperCase())
            .setValue(workout.toLowerCase())
        );

    return menuOptions;
};


module.exports = {
    cooldown: 3,
    category: 'workout',
    data: new SlashCommandBuilder()
        .setName('delete-workout')
        .setDescription('Delete a workout split.'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        const menuOptions = await getWorkouts(discordId);
        

        await interaction.reply({content: `${menuOptions}`, flags: MessageFlags.Ephemeral});
    },
};