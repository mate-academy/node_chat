const { client } = require('../utils/db.js');
const { DataTypes } = require('sequelize');

const User = client.define(
  'usersSocket',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'usersSocket',
  },
);

module.exports = { User };
