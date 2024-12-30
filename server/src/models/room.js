const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../utils/db.js');

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
  },
);

module.exports = {
  Room,
};
