const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js');

module.exports = sequelize.define('Exercise', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    workoutId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Workouts',
            key: 'id',
        }
    },
    exerciseName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sets: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reps: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['workoutId', 'exerciseName', 'sets', 'reps']
        }
    ]
});