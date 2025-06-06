const sequelize = require('./utils/database');
const models = require('./models');

async function syncDatabase() {
    try {
        // Disable foreign key checks
        await sequelize.query('PRAGMA foreign_keys = OFF;');
        
        // Sync all models
        // await sequelize.sync({force: true});
        await sequelize.sync({alter: true});
        
        // Re-enable foreign key checks
        await sequelize.query('PRAGMA foreign_keys = ON;');
        
        console.log('Database synched!');
    } catch (error) {
        console.error('Sync error:', error);
    }
}

syncDatabase();
