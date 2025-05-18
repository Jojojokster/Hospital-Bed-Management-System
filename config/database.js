const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a Sequelize instance with database connection details
const sequelize = new Sequelize(
  process.env.DATABASE,         // Database name
  process.env.DATABASE_USER,    // Database username
  process.env.DATABASE_PASSWORD, // Database password
  {
    host: process.env.DATABASE_HOST, // Database host
    dialect: 'mysql',               // Database dialect (e.g., mysql, postgres, sqlite)
    logging: console.log,                 // Disable logging queries to the console (optional)
  }
);

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); 
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;