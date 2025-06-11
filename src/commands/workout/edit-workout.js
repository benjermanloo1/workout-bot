const { Exercise, Workout } = require('../../models')
const { ActionRowBuilder, ComponentType, MessageFlags, ModalBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/*
Edit:
Users can edit their workout splits.
*/

async function buildMenu(discordId) {
    const workouts = await Workout.findAll({
            where: {discordId},
        });

    const workoutNames = workouts.map(workout => workout.workoutName);
    const menuOptions = workoutNames
        .slice(0, 25)
        .map(workout => 
            new StringSelectMenuOptionBuilder()
                .setLabel(workout)
                .setValue(workout)
            );

    return menuOptions;
};

async function getWorkout(discordId, interaction) {
    const menuOptions = await buildMenu(discordId);

    if (menuOptions.length === 0) {
        return interaction.reply({
            content: "You don't have any workouts to edit.",
            flags: MessageFlags.Ephemeral,
        });
    }

    let workoutSelect = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder('Which workout would you like to edit?')
        .addOptions(menuOptions)
        .setMaxValues(1);

    const workoutRow = new ActionRowBuilder().addComponents(workoutSelect);

    const workoutMessage = await interaction.reply({
        components: [workoutRow],
        flags: MessageFlags.Ephemeral,
    });

    return new Promise((resolve, reject) => {
        const workoutCollector = workoutMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
            time: 30_000,
        });
        
        workoutCollector.on('collect', async (infoInteraction) => {
            const disabledSelect = StringSelectMenuBuilder.from(workoutSelect).setDisabled(true);

            const selection = await Workout.findOne({
                where: {
                    discordId: discordId,
                    workoutName: infoInteraction.values[0],
                },
                include: [Exercise],
                order: [[Exercise, 'id', 'ASC']],
            });
            
            resolve({ selection, infoInteraction });
            workoutCollector.stop('selected');
        });

        workoutCollector.on('end', async () => {
            const timeoutSelect = StringSelectMenuBuilder.from(workoutSelect).setDisabled(true);
            const timeoutRow = new ActionRowBuilder().addComponents(timeoutSelect);

            try {
                await interaction.editReply({
                    components: [timeoutRow],
                });
            } catch (error) {
                console.error('Failed to edit reply after collector ended:', error);        
            }

            resolve(null);
        });
    });
};

async function setupModal(selection, interaction) {
    const workoutName = selection.workoutName;
    const exercises = selection.Exercises;
    const formattedExercises = exercises.map(e => `${e.exerciseName.toLowerCase()} ${e.sets} ${e.reps}`).join('\n');

    const modal = new ModalBuilder()
        .setCustomId(`edit-workout-modal-${selection.id}`)
        .setTitle('Edit a Workout');

    const workoutNameInput = new TextInputBuilder()
        .setCustomId('workoutNameInput')
        .setLabel('Name of workout')
        .setValue(workoutName)
        .setStyle(TextInputStyle.Short);
    
    const exerciseInput = new TextInputBuilder()
        .setCustomId('exerciseInput')
        .setLabel('Exercises performed')
        .setValue(formattedExercises || '')
        .setStyle(TextInputStyle.Paragraph);

    const nameRow = new ActionRowBuilder().addComponents(workoutNameInput);
    const exerciseRow = new ActionRowBuilder().addComponents(exerciseInput);

    modal.addComponents(nameRow, exerciseRow);

    await interaction.showModal(modal);
};

async function editWorkout(discordId, workoutId, newWorkoutName, exercises) {
    const workout = await Workout.findOne({
        where: {
            id: workoutId,
            discordId,
        },
    });

    if (!workout) {
        return `You do not have that workout.`;
    }

    if (newWorkoutName && newWorkoutName !== workout.workoutName) {
        const existingWorkout = await Workout.findOne({
            where: { discordId, workoutName: newWorkoutName },
        });
        if (existingWorkout) {
            return `You already have a workout named "${newWorkoutName}". Please choose another name.`;
        }
        workout.workoutName = newWorkoutName;
        await workout.save();
    }

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
    });

    await Exercise.destroy({
        where: { workoutId: workout.id }
    });
    
    for (const exercise of validExercises) {
        const existingExercise = await Exercise.findOne({
            where: {
                workoutId: workout.id,
                exerciseName: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
            },
        });

        if (existingExercise) {
            continue;
        } 

        await Exercise.create({
            workoutId: workout.id,
            exerciseName: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
        });
            
    };

    if (invalidLines.length > 0) {
        return `⚠️  Workout '${newWorkoutName}' saved, but some lines were invalid:\n${invalidLines.join('\n')}`;
    } else {
        const numExercises = validExercises.length === 1 ? 'exercise' : 'exercises';
        return `✅  Workout '${newWorkoutName}' saved with ${validExercises.length} ${numExercises}.  ✅`;
    }
};

function capitalizeWords(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

module.exports = {
    cooldown: 3,
    category: 'workout',
    data: new SlashCommandBuilder()
        .setName('edit-workout')
        .setDescription('Edit a workout split.'),
    async execute(interaction) {
        const discordId = interaction.user.id;
        const result = await getWorkout(discordId, interaction);

        if (result) {
            const { selection, infoInteraction } = result;
            await setupModal(selection, infoInteraction);

            const filter = (infoInteraction) => infoInteraction.customId === `edit-workout-modal-${selection.id}`;

            infoInteraction.awaitModalSubmit({ filter, time: 300_000 })
                .then(async (modalInteraction) => {
                    const newWorkoutName = modalInteraction.fields.getTextInputValue('workoutNameInput').trim();
                    const exercises = modalInteraction.fields.getTextInputValue('exerciseInput');
                    const workoutId = modalInteraction.customId.split('-').pop();
    
                    const message = await editWorkout(discordId, workoutId, newWorkoutName, exercises);
    
                    await modalInteraction.reply({ content: `${message}`, flags: MessageFlags.Ephemeral });
                })
                .catch((error) => {
                    console.log(`${error}`);
                });
        } else {
            await interaction.followUp({
                content: 'No workout was selected.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};