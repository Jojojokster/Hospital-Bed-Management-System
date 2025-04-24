const { DataTypes } = require('sequelize');
const { status } = require('../utils/constants');
const sequelize = require('../config/database');
require('dotenv').config();

const Bed = sequelize.define('Bed', {
    bed_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(status.available, status.occupied, status.maintenance),
      defaultValue: 'available',
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Patients', // The table being referenced
        key: 'patient_id', // The column being referenced
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    expected_availability: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true, // Enable createdAt and updatedAt
  });
  
  module.exports = { sequelize, Bed };