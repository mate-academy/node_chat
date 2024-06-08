const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.js');

const User = sequelize.define('User', {
  username: DataTypes.STRING,
}, {
  tableName: 'Users'
});

module.exports = {
  User,
}
