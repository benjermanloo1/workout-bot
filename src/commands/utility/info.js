const { Exercise, Lift, Streak, User, Workout } = require('../../models')
const { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ComponentType, ContextMenuCommandBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Message, ButtonInteraction} = require('discord.js');

/*
Info:
Provide name, streak, current maxes, etc.
Able to look at other users information, unless private.
*/

function capitalizeFirstLetter(str) {
    if (!str) return str; // handle empty string or null
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function buildMenuOptions(options) {
    let menuOptions = []
    
    for (const option of options) {
        const menuOption = new StringSelectMenuOptionBuilder()
            .setLabel(option.label)
            .setValue(option.value);

        menuOptions.push(menuOption);
    }

    return menuOptions;
};

async function getExercises(workoutId) {
    const exercises = await Exercise.findAll({ where: {workoutId} });

    if (!exercises) return 'No exercises found.';

    const formattedExercises = exercises.map(e => `${capitalizeFirstLetter(e.exerciseName)}: ${e.sets} sets of ${e.reps}`).join('\n');

    return formattedExercises;
};

async function displayExercises(infoInteraction, options) {
    const viewButton = new ButtonBuilder()
        .setCustomId('view-button')
        .setLabel('View Exercises')
        .setStyle(ButtonStyle.Primary);

    const cancelButton = new ButtonBuilder()
        .setCustomId('cancel-button')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const buttonRow = new ActionRowBuilder().addComponents(viewButton, cancelButton);

    const buttonMessage = await infoInteraction.followUp({
        components: [buttonRow],
        flags: MessageFlags.Ephemeral,
    });

    const buttonCollector = buttonMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === infoInteraction.user.id,
        time: 10_000,
    });

    buttonCollector.on('collect', async (interaction) => {
        if (interaction.customId === 'view-button') {
            const menuOptions = await buildMenuOptions(options);
            const optionMap = Object.fromEntries(options.map(opt => [opt.value, opt.label]));

            const routineMenu = new StringSelectMenuBuilder()
                .setCustomId('workout-routine-menu')
                .setPlaceholder('Choose workout(s) to view their exercises.')
                .addOptions(menuOptions)
                .setMinValues(1)
                .setMaxValues(menuOptions.length);

            const routineRow = new ActionRowBuilder().addComponents(routineMenu);

            const routineMessage = await interaction.update({
                components: [routineRow],
                flags: MessageFlags.Ephemeral,
            });

            const routineCollector = routineMessage.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.user.id === interaction.user.id && i.customId === 'workout-routine-menu',
                time: 30_000,
            });

            routineCollector.on('collect', async (routineInteraction) => {
                const disabledSelect = StringSelectMenuBuilder.from(routineMenu).setDisabled(true);
                const disabledRow = new ActionRowBuilder().addComponents(disabledSelect);

                await routineInteraction.reply({
                    components: [disabledRow],
                    flags: MessageFlags.Ephemeral,
                });
                
                const selections = routineInteraction.values;

                const results = await Promise.all(selections.map(async (workoutId) => {
                    const exercises = await getExercises(workoutId);

                    return `**${capitalizeFirstLetter(optionMap[workoutId])}:**\n${exercises}`
                }));

                const message = results.join('\n\n');

                await routineInteraction.followUp({
                    content: message,
                    flags: MessageFlags.Ephemeral,
                });
            });
        } else if (interaction.customId === 'cancel-button') {
            await interaction.update({
                content: '❌ Cancelled viewing workouts.',
                components: [],
            });
        }

        buttonCollector.stop();
    });
};

async function displayInformation(discordId, username, interaction) {
    let infoSelect = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder(`What would you like to know about ${username}?`)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Streak')
                .setDescription(`${username}'s streak.`)
                .setValue('streak'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Max Lifts')
                .setDescription(`${username}'s max lifts.`)
                .setValue('max_lifts'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Workout Routines')
                .setDescription(`${username}'s workout routines.`)
                .setValue('workout_routines'),
        )
        .setMinValues(1)
        .setMaxValues(3);
    
    const infoRow = new ActionRowBuilder().addComponents(infoSelect);

    const infoMessage = await interaction.reply({
        components: [infoRow],
        flags: MessageFlags.Ephemeral,
    });

    const infoCollector = infoMessage.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 20_000,
    });

    infoCollector.on('collect', async (infoInteraction) => {
        const disabledSelect = StringSelectMenuBuilder.from(infoSelect).setDisabled(true);
        const disabledRow = new ActionRowBuilder().addComponents(disabledSelect);

        await infoInteraction.update({
            components: [disabledRow],
            flags: MessageFlags.Ephemeral,
        });

        const selections = infoInteraction.values;

        const { message, options} = await retrieveInformation(discordId, username, selections);

        await infoInteraction.followUp({
            content: `${message}`,
            flags: MessageFlags.Ephemeral,
        });

        if (options.length > 0) {
            await displayExercises(infoInteraction, options);
        }
    });

    infoCollector.on('end', async () => {
        const timeoutSelect = StringSelectMenuBuilder.from(infoSelect).setDisabled(true);
        const timeoutRow = new ActionRowBuilder().addComponents(timeoutSelect);

        try {
            await interaction.editReply({
                components: [timeoutRow],
            });
        } catch (error) {
            console.error('Failed to edit reply after collector ended:', error);        
        }
    });
};

async function retrieveInformation(discordId, username, selections) {
    let messages = [];
    let combinedOptions = [];

    const user = await User.findOne({ where: { discordId, username }});

    if (!user) {
        messages.push(`${username} is not stored in the database.`);
        return {
            message: messages,
            options: combinedOptions,
        };
    };

    for (const choice of selections) {
        switch(choice) {
            case 'streak':
                const streak = await Streak.findOne({ where: {discordId} });
                messages.push(
                    streak
                        ? `🔥  ${username} is currently on a ${streak.day}-day streak!  🔥`
                        : `${username} does not currently have a streak.`
                );
                break;
            case 'max_lifts':
                const lifts = await Lift.findAll({ where: {discordId} });
                if (lifts.length === 0) {
                    messages.push(`${username} has not recorded any max lifts.`);
                } else {
                    const maxes = lifts.map(lift => `${capitalizeFirstLetter(lift.liftName)} - ${lift.weight} lbs`).join('; ');
                    messages.push(`🏋️  ${username}'s max lifts: ${maxes}  🏋️`);
                }
                break;
            case 'workout_routines':
                const workouts = await Workout.findAll({ where: {discordId} });
                if (workouts.length === 0) {
                    messages.push(`${username} has not recorded any workout routines.`);
                } else {
                    const routines = workouts.map(workout => capitalizeFirstLetter(workout.workoutName)).join(', ');
                    const options = workouts.map(workout => ({
                        label: capitalizeFirstLetter(workout.workoutName),
                        value: workout.id.toString(),
                    }));

                    messages.push(`📅  ${username}'s workout routines: ${routines}  📅`);
                    combinedOptions = options;
                }
                break;
        }
    }

    return {
        message: messages.join('\n'),
        options: combinedOptions,
    };
};

module.exports = {
    cooldown: 3,
    category: 'utility',
    data: new ContextMenuCommandBuilder()
        .setName('User Info')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const discordId = interaction.targetUser.id;
        const username = interaction.targetUser.username;

        await displayInformation(discordId, username, interaction);
    },
};