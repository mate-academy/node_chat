'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./User');

const Direct = client.define('direct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  user1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user2: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      customValidator(value) {
        if (value === this.user1) {
          throw new Error('Two different users are required for a direct');
        }
      },
    },
  },
});

Direct.belongsTo(User, {
  foreignKey: 'user1',
  targetKey: 'username',
  as: 'directUser1',
});

User.hasMany(Direct, {
  sourceKey: 'username',
  foreignKey: 'user1',
  as: 'directUser1',
});

Direct.belongsTo(User, {
  foreignKey: 'user2',
  targetKey: 'username',
  as: 'directUser2',
});

User.hasMany(Direct, {
  sourceKey: 'username',
  foreignKey: 'user2',
  as: 'directUser2',
});

module.exports = { Direct };
