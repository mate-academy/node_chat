const { client } = require("../utils/db");
const { DataTypes } = require('sequelize');


const Message = client.define('message', {
  socketId : {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  __createdtime__: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  __updatedtime__: {
    type: DataTypes.DATE,
    allowNull: false,
  },
 }, {
  primaryKey: true,
  autoIncrement: true,
  createdAt: false,
  updatedAt: false,
  tableName: 'message',
});

module.exports = {
  Message,
}
