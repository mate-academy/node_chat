'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../db');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'user',
  },
);

module.exports = { User };
