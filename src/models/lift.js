const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js');

module.exports = sequelize.define('Lift', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    liftName: {
        type: DataTypes.STRING,
        primaryKey: false,
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