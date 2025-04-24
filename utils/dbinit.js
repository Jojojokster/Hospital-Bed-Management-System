const { sequelize } = require('../models');

module.exports = async () => {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: false });
    console.log('All tables synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};