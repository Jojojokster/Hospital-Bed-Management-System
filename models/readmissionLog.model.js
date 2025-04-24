const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReadmissionLog = sequelize.define('ReadmissionLog', {
    readmission_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Patients', // References the Patients table
            key: 'patient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    readmission_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true, // Enable createdAt and updatedAt
});

module.exports = { sequelize, ReadmissionLog };