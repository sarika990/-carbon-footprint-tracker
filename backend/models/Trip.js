const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  distanceKm: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  co2Emitted: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  suggestedAlternative: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  potentialCo2Saved: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  date: {
    type: DataTypes.STRING, // YYYY-MM-DD
    allowNull: false,
  },
  startLocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  endLocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Trip;
