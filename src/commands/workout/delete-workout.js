const { Workout } = require('../../models')
const { ActionRowBuilder, ComponentType, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

/*
Edit:
Users can delete their workout splits.
*/

async function deleteWorkout(discordId, interaction) {
    const menuOptions = await getWorkouts(discordId);

    if (menuOptions.length === 0) {
        return interaction.reply({
            content: "You don't have any workouts to delete.",
            flags: MessageFlags.Ephemeral,
        });
    }

    let workoutSelect = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder('Which workout(s) would you like to delete?')
        .addOptions(menuOptions)
        .setMinValues(1)
        .setMaxValues(menuOptions.length);

    const workoutRow = new ActionRowBuilder().addComponents(workoutSelect);

    const workoutMessage = await interaction.reply({
        components: [workoutRow],
        flags: MessageFlags.Ephemeral,
    });

    const workoutCollector = workoutMessage.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 30_000,
    });

    workoutCollector.on('collect', async (infoInteraction) => {
        const disabledSelect = StringSelectMenuBuilder.from(workoutSelect).setDisabled(true);
        const disabledRow = new ActionRowBuilder().addComponents(disabledSelect);

        await infoInteraction.update({
            components: [disabledRow],
            flags: MessageFlags.Ephemeral,
        });

        const selections = infoInteraction.values;

        await Workout.destroy({
            where: {
                discordId,
                workoutName: selections.map(name => name),
            },
        });

        if (selections.length === 1) {
            await infoInteraction.followUp({
                content: `❌  Deleted workout: ${selections[0]}  ❌`,
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await infoInteraction.followUp({
                content: `❌  Deleted workouts: ${selections.join(', ')}  ❌`,
                flags: MessageFlags.Ephemeral,
            });
        }
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
    });
};


async function getWorkouts(discordId) {
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


module.exports = {
    cooldown: 3,
    category: 'workout',
    data: new SlashCommandBuilder()
        .setName('delete-workout')
        .setDescription('Delete a workout split.'),
    async execute(interaction) {
        const discordId = interaction.user.id;

        await deleteWorkout(discordId, interaction);
    },
};