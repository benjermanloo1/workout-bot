const { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/*
Add:
Users can add their workouts.
*/

async function setupModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('add-workout-modal')
        .setTitle('Add a Workout');

    const workoutNameInput = new TextInputBuilder()
        .setCustomId('workoutNameInput')
        .setLabel('Name of workout')
        .setPlaceholder('e.g. Pull')
        .setStyle(TextInputStyle.Short);
    
    const exerciseInput = new TextInputBuilder()
        .setCustomId('exerciseInput')
        .setLabel('Exercises performed')
        .setPlaceholder('Name of exercise - # of sets - # of reps\ne.g. bench - 3 - 5')
        .setStyle(TextInputStyle.Paragraph);

    const nameRow = new ActionRowBuilder().addComponents(workoutNameInput);
    const exerciseRow = new ActionRowBuilder().addComponents(exerciseInput);

    modal.addComponents(nameRow, exerciseRow);

    await interaction.showModal(modal);
};


module.exports = {
    cooldown: 3,
    category: 'workout',
    data: new SlashCommandBuilder()
        .setName('add-workout')
        .setDescription('Add a workout.'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const username = interaction.user.username;

        await setupModal(interaction);

        const filter = (interaction) => interaction.customId === 'add-workout-modal';

        interaction.awaitModalSubmit({ filter, time: 120_000 })
            .then((modalInteraction) => {
                const workoutName = modalInteraction.fields.getTextInputValue('workoutNameInput');
                const exercises = modalInteraction.fields.getTextInputValue('exerciseInput');

                modalInteraction.reply(`${workoutName}\n${exercises}`);
            })
            .catch((error) => {
                console.log(`${error}`);
            });
    },
};