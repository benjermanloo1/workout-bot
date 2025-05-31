const Sequelize = require('sequelize');

module.exports = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    host: 'localhost',

    storage: 'src/database.sqlite',
    logging: false,
});