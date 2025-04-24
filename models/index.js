const { Patient } = require('./patient.model'); // Import the Patient model
const { Bed } = require('./beds.model'); // Import the Bed model
const { ReadmissionLog } = require('./readmissionLog.model');
const sequelize = require('../config/database'); // Import Sequelize instance

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Define associations
Patient.hasOne(Bed, { foreignKey: 'patient_id' }); // A patient can have one bed
Bed.belongsTo(Patient, { foreignKey: 'patient_id' }); // A bed belongs to a patient
Patient.hasMany(ReadmissionLog, { foreignKey: 'patient_id' }); // A patient can have one bed
ReadmissionLog.belongsTo(Patient, { foreignKey: 'patient_id' }); 

// Sync all models with the database
(async () => {
  try {
    await sequelize.sync({ force: false }); // Set `force: true` only during development to reset tables
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();

// Export models and Sequelize instance
module.exports = {
  Patient,
  Bed,
  ReadmissionLog,
  sequelize,
};