const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Token = sequelize.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    foreignKey: true,
  },
});

module.exports = {
  Token,
};
