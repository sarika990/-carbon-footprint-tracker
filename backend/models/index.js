const User = require('./User');
const Trip = require('./Trip');
const Badge = require('./Badge');

// Associations
User.hasMany(Trip, { foreignKey: 'userId', as: 'trips', onDelete: 'CASCADE' });
Trip.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Badge, { foreignKey: 'userId', as: 'badges', onDelete: 'CASCADE' });
Badge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Trip,
  Badge,
};
