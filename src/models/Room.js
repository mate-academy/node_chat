const { DataTypes, UUIDV4 } = require('sequelize');
const { client } = require('../db');

const Room = client.define('rooms', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = { Room };
