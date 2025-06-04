const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js');

module.exports = sequelize.define('Streak', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    discordId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    day: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});