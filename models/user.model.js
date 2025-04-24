// models/index.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');
const { roles } = require('../utils/constants');
const sequelize = require('../config/database');
require('dotenv').config();

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(roles.admin, roles.moderator, roles.client),
  },
}, {
  timestamps: true, // Disable createdAt and updatedAt
});

// Hash password before creating a new user
User.beforeCreate(async (user) => {
  if (user.isNewRecord) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const userEmail = user.email?.toLowerCase().trim();

    // Assign admin role if the email matches
    if (userEmail === adminEmail) {
      user.role = roles.admin;
    } else {
      user.role = roles.client; // Explicitly set the role to 'client'
    }
  }
});

// Method to validate password
User.prototype.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw createHttpError.InternalServerError(error.message);
  }
};

// Add a 'beforeUpdate' hook to the User model
User.beforeUpdate(async (user, options) => {
  // Check if the password is being updated
  if (user.changed('password')) {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt); // 10 is the salt rounds
      user.password = hashedPassword; // Replace the plain-text password with the hashed one
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }
});

module.exports = { sequelize, User };