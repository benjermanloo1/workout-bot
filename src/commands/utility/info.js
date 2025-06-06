const { Lift, Streak, User } = require('../../models')
const { ActionRowBuilder, ApplicationCommandType, ComponentType, ContextMenuCommandBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Message} = require('discord.js');

/*
Info:
Provide name, streak, current maxes, etc.
Able to look at other users information, unless private.
*/

function capitalizeFirstLetter(str) {
    if (!str) return str; // handle empty string or null
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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
            time: 10_000,
    });

    infoCollector.on('collect', async (infoInteraction) => {
            const disabledSelect = StringSelectMenuBuilder.from(infoSelect).setDisabled(true);
            const disabledRow = new ActionRowBuilder().addComponents(disabledSelect);

            await infoInteraction.update({
                components: [disabledRow],
                flags: MessageFlags.Ephemeral,
            });

            const selections = infoInteraction.values;

            const results = await retrieveInformation(discordId, username, selections);

            await infoInteraction.followUp({
                content: `${results}`,
                flags: MessageFlags.Ephemeral,
            });
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
    const user = await User.findOne({ where: { discordId, username }});

    if (!user) return `${username} is not stored in the database.`;
    

    const results = await Promise.all(
        selections.map(async (choice) => {
            switch (choice) {
                case 'streak':
                    const streak = await Streak.findOne({ where: { discordId } });
                    if (!streak) return `${username} does not currently have a streak.`;
                    else return `🔥  ${username} is currently on a ${streak.day}-day streak!  🔥`;
                case 'max_lifts':
                    const lifts = await Lift.findAll({ where: { discordId } });
                    if (!lifts) return `${username} has not recorded any max lifts.`;
                    else {
                        const maxes = lifts.map(lift => `${capitalizeFirstLetter(lift.liftName)} - ${lift.weight} lbs`).join('; ');
                        return `🏋️  ${username}'s max lifts: ${maxes}  🏋️`;
                    } 
                case 'workout_routines': 
                    return `📅 PLACEHOLDER 📅`;
                default: return '';
            }
        }
    ));

    return results.join('\n');
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