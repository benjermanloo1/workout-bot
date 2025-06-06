const { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/*
Add:
Users can add their workouts.
*/

async function setupModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId(interaction.id)
        .setTitle('Add a Workout');

    const workoutNameInput = new TextInputBuilder()
        .setCustomId('workoutNameInput')
        .setLabel('Name of workout')
        .setStyle(TextInputStyle.Short);
    
    const exerciseInput = new TextInputBuilder()
        .setCustomId('exerciseInput')
        .setLabel('Exercises performed')
        .setPlaceholder('Name of exercise - # of sets - # of reps')
        .setStyle(TextInputStyle.Paragraph);

    const nameRow = new ActionRowBuilder().addComponents(workoutNameInput);
    const exerciseRow = new ActionRowBuilder().addComponents(exerciseInput);

    modal.addComponents(nameRow, exerciseRow);

    await interaction.showModal(modal);
    await interaction.reply(`${interaction.fields.getTextInputValue('workoutNameInput')}\n${interaction.fields.getTextInputValue('exerciseInput')}`);
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

        await setupModal(discordId, username, interaction);
    },
};