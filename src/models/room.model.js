const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');

const Room = client.define('room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // userId: {
  //   type: DataTypes.UUID,
  //   allowNull: false,
  // },
});

Room.belongsTo(User, {
  onDelete: 'CASCADE',
});
User.hasMany(Room);

module.exports = {
  Room,
};
