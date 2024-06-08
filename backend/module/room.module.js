const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.js');
const { User } = require('./index.js');

const Room = sequelize.define('Room', {
  roomname: DataTypes.STRING,
  idUser: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    }
  }
}, {
  tableName: 'Rooms'
});

module.exports = {
  Room,
}
