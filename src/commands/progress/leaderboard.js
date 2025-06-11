const { Lift, User } = require('../../models')
const { MessageFlags, SlashCommandBuilder } = require('discord.js');

/*
Leaderboard:
Users can see who has the highest singular max lift / combined max lifts.
*/

function capitalizeFirstLetter(str) {
    if (!str) return str; // handle empty string or null
    return str.charAt(0).toUpperCase() + str.slice(1);
};


async function getLeaderboard(users, selection) {
    const lifts = await getLifts(users);

    const filtered = lifts.filter(entry => entry[selection] > 0);
    
    const sorted = filtered.sort((a, b) => b[selection] - a[selection]);

    const medals = ['🥇', '🥈', '🥉'];

    const leaderboard = sorted.map((entry, index) => {
        const medal = medals[index] ?? `#${index + 1}`;
        return `${medal} ${entry.username}: ${entry[selection]} lbs`;
    });

    return leaderboard.join('\n');
};

async function getLifts(users) {
    const lifts = users.map(async ({ discordId, username}) => {
        try {
            const [bench, squat, deadlift] = await Promise.all([
                Lift.findOne({ where: { discordId, liftName: 'bench' } }),
                Lift.findOne({ where: { discordId, liftName: 'squat' } }),
                Lift.findOne({ where: { discordId, liftName: 'deadlift' } }),
            ]);

            const benchWeight = bench?.weight ?? 0;
            const squatWeight = squat?.weight ?? 0;
            const deadliftWeight = deadlift?.weight ?? 0;

            return {
                username,
                bench: benchWeight,
                squat: squatWeight,
                deadlift: deadliftWeight,
                overall: benchWeight + squatWeight + deadliftWeight
            };
        } catch (error) {
            console.log(`Error fetching lifts for ${username}.`);
            return {
                username,
                bench: 0,
                squat: 0,
                deadlift: 0,
                overall: 0,
            };
        }
    });

    return await Promise.all(lifts);
};

module.exports = {
    cooldown: 3,
    category: 'progress',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the leaderboard.')
        .addStringOption(option => 
            option
                .setName('rankings')
                .setDescription('Leaderboard to view.')
                .setRequired(true)
                .addChoices(
                    { name: 'bench press', value: 'bench' },
                    { name: 'squat', value: 'squat' },
                    { name: 'deadlift', value: 'deadlift' },
                    { name: 'overall', value: 'overall' },
                ),
            ),
    async execute(interaction) {
        const users = await User.findAll();

        if (users.length === 0) {
            await interaction.reply({
                content: 'There are no users in the database.',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            const selection = interaction.options.getString('rankings');
            const leaderboard = await getLeaderboard(users, selection);

            await interaction.reply(`**${capitalizeFirstLetter(selection)} leaderboard:**\n${leaderboard}`);
        };
    },
};