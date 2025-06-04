const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js');

module.exports = sequelize.define('Lift', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    discordId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    liftName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dateLogged: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
});