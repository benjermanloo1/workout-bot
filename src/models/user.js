const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js');

module.exports = sequelize.define('User', {
    discordId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});