const sequelize = require('./utils/database');
require('./models/user');
require('./models/lift');

sequelize.sync({force: true});
// sequelize.sync({alter: true});