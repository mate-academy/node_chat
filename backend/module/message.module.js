const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db.js');
const { Room, User } = require('./index.js');

const Message = sequelize.define('Message', {
  message: DataTypes.STRING,
  idUser: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    }
  },
  idRoom: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: 'id',
    }
  }
}, {
  tableName: 'Messages',
});

module.exports = {
  Message,
}
