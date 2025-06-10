const { Exercise, Workout, User } = require('../../models')
const { ActionRowBuilder, MessageFlags, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const workout = require('../../models/workout');

/*
Add:
Users can add their workouts.
*/

async function addWorkout(discordId, username, workoutName, exercises) {
    await User.upsert({ discordId, username });

    const workout = await Workout.findOne({
        where: {
            discordId: discordId,
            workoutName: workoutName,
        },
    });

    if (workout) {
        return `🙂‍↔️  You already have a workout called ${workoutName}  🙂‍↔️`;
    } 
        
    const newWorkout = await Workout.create({ discordId, workoutName });

    const lines = exercises.split('\n').filter(l => l.trim() !== '');
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

        const name = capitalizeWords(parts.join(' '));

        const isValidName = /^[a-zA-Z\s\-()]+$/.test(name);

        if (!isValidName) {
            invalidLines.push(`Invalid exercise name: ${name}`);
            return;
        }

        validExercises.push({ name, sets, reps });
    })

    for (const exercise of validExercises) {
        const existingExercise = await Exercise.findOne({
            where: {
                workoutId: newWorkout.id,
                exerciseName: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
            },
        });

        if (existingExercise) {
            continue;
        } 

        await Exercise.create({
            workoutId: newWorkout.id,
            exerciseName: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
        });
        
    };

    if (invalidLines.length > 0) {
        return `⚠️  Workout '${workoutName}' saved, but some lines were invalid:  ⚠️\n${invalidLines.join('\n')}`;
    } else {
        const numExercises = validExercises.length === 1 ? 'exercise' : 'exercises';
        return `✅  Workout '${workoutName}' saved with ${validExercises.length} ${numExercises}.  ✅`;
    }
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

function capitalizeWords(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


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

        interaction.awaitModalSubmit({ filter, time: 300_000 })
            .then(async (modalInteraction) => {
                const workoutName = modalInteraction.fields.getTextInputValue('workoutNameInput').trim();
                const exercises = modalInteraction.fields.getTextInputValue('exerciseInput');

                const message = await addWorkout(discordId, username, workoutName, exercises);

                await modalInteraction.reply({ content: `${message}`, flags: MessageFlags.Ephemeral });

            })
            .catch((error) => {
                console.log(`${error}`);
            });
    },
};