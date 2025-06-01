const User = require('./user');
const Lift = require('./lift');

// Define relationships
User.hasMany(Lift, { foreignKey: 'discordId' });
Lift.belongsTo(User, { foreignKey: 'discordId' });

module.exports = { User, Lift };