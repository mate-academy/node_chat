const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const User = client.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = {
  User,
};
