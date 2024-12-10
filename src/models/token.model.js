const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./user.model');

const Token = sequelize.define(
  'token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  },
);

Token.belongsTo(User);
User.hasOne(Token);

module.exports = { Token };
