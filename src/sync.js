const sequelize = require('./utils/database');
const models = require('./models')

// sequelize.sync({force: true})
sequelize.sync({alter: true})
    .then(() => console.log('Database synched!'))
    .catch(console.error);

