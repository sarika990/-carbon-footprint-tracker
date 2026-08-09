const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  streakCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastLogDate: {
    type: DataTypes.STRING, // YYYY-MM-DD
    allowNull: true,
  },
});

module.exports = User;
