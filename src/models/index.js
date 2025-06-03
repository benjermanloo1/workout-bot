const User = require('./user');
const Lift = require('./lift');
const Streak = require('./streak');


// defining relationships between models
User.hasMany(Lift, { foreignKey: 'discordId' });
User.hasOne(Streak, { foreignKey: 'discordId' })
Lift.belongsTo(User, { foreignKey: 'discordId' });
Streak.belongsTo(User, { foreignKey: 'discordId' })

module.exports = { User, Lift, Streak };