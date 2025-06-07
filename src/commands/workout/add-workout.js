const { Exercise, Workout, User } = require('../../models')
const { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const workout = require('../../models/workout');

/*
Add:
Users can add their workouts.
*/

async function addWorkout(discordId, username, workoutName, exercises, modalInteraction) {
    await User.upsert({ discordId, username });

    const workout = Workout.findOne({
        where: {
            discordId: discordId,
            workoutName: workoutName,
        },
    });

    // if (workout) {
    //     return `🙂‍↔️  You already have a workout called ${workoutName}  🙂‍↔️`;
    // } else {
    //     await Workout.create({
    //     discordId,
    //     workoutName,
    // })};

    const lines = exercises.split('\n');
    const validExercises = [];
    const invalidLines = [];

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);

        if (parts.length < 3) {
            invalidLines.push(`Wrong format: ${line}`);
            return;
        }

        const reps = parseInt(parts.pop(), 10);
        const sets = parseInt(parts.pop(), 10);

        if (isNaN(reps) || isNaN(sets)) {
            invalidLines.push(`Invalid reps/sets: ${line}`);
            return;
        }

        const name = parts.join(' ');
        validExercises.push({ name, sets, reps });
    })

    if (invalidLines.length > 0) {
        await modalInteraction.reply(`⚠️  Workout saved, but some lines were invalid:\n\n${invalidLines.join('\n')}  ⚠️`);
    } else {
        await modalInteraction.reply(`✅  Workout "${workoutName}" saved with ${validExercises.length} exercises.  ✅`);
    }



    return splitExercises;
};

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
        .setPlaceholder('Name of exercise | # of sets | # of reps\ne.g. bench 3 5')
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
            .then(async (modalInteraction) => {
                const workoutName = modalInteraction.fields.getTextInputValue('workoutNameInput');
                const exercises = modalInteraction.fields.getTextInputValue('exerciseInput');

                await addWorkout(discordId, username, workoutName, exercises, modalInteraction);

            })
            .catch((error) => {
                console.log(`${error}`);
            });
    },
};