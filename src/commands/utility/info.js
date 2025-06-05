const { User } = require('../../models')
const { ActionRowBuilder, ComponentType, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, StringSelectMenuOptionBuilder, Message } = require('discord.js');

/*
Info:
Provide name, streak, current maxes, etc.
Able to look at other users information, unless private.
*/

module.exports = {
    cooldown: 3,
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about a user in the server.'),
    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;

        let userSelect = new UserSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder('Select a user.');

        const actionRow = new ActionRowBuilder()
            .addComponents(userSelect);

        const reply = await interaction.reply({
            components: [actionRow],
            flags: MessageFlags.Ephemeral,
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.UserSelect,
            filter: (i) => i.user.id === userId && i.customId === interaction.id,
            time: 30_000,
        });

        collector.on('collect', async (userInteraction) => {  
            userSelect.setDisabled(true);
            await userInteraction.update({
                components: [actionRow],
                flags: MessageFlags.Ephemeral
            });

            // await userInteraction.followUp({ content: `User selected: ${username}`, flags: MessageFlags.Ephemeral });

            let infoSelect = new StringSelectMenuBuilder()
                .setCustomId(userInteraction.id)
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

            const infoMessage = await userInteraction.followUp({
                components: [infoRow],
                flags: MessageFlags.Ephemeral,
            });

            const infoCollector = infoMessage.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.user.id === userId && i.customId === userInteraction.id,
                time: 30_000,
            });

            infoCollector.on('collect', async (infoInteraction) => {
                infoSelect.setDisabled(true);
                await infoInteraction.update({
                    components: [infoRow],
                    flags: MessageFlags.Ephemeral
                });

                const selections = infoInteraction.values;



                // CREATE HELPER FUNCTION TO RETRIEVE INFO FROM DATABASE
                const results = selections.map((choice) => {
                    switch (choice) {
                        case 'streak': return `🔥 Current streak: 12 days`;
                        case 'max_lifts': return `🏋️ Max Lifts: Bench 200 lbs, Squat 300 lbs`;
                        case 'workout_routines': return `📅 Total Workouts: 45 sessions`;
                        default: return '';
                    }
                }).join('\n');

                await infoInteraction.followUp({
                    content: `${results}`,
                    flags: MessageFlags.Ephemeral,
                });
            });
        });
    },
};