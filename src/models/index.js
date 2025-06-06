const User = require('./user');
const Lift = require('./lift');
const Streak = require('./streak');
const Workout = require('./workout');
const Exercise = require('./exercise');

// defining relationships between models
User.hasMany(Lift, { foreignKey: 'discordId' });
User.hasOne(Streak, { foreignKey: 'discordId' });
User.hasMany(Workout, { foreignKey: 'discordId' });

Lift.belongsTo(User, { foreignKey: 'discordId' });

Streak.belongsTo(User, { foreignKey: 'discordId' });

Workout.belongsTo(User, { foreignKey: 'discordId' });
Workout.hasMany(Exercise, { foreignKey: 'workoutId'})

Exercise.belongsTo(Workout, { foreignKey: 'workoutId' });

module.exports = { User, Lift, Streak, Workout, Exercise };