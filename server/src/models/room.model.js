const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');

const Room = client.define(
  'room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
  },
);

Room.belongsTo(User, { onDelete: 'CASCADE' });
User.hasMany(Room);

const initRooms = async () => {
  await Room.sync({ force: true });
};

module.exports = { Room, initRooms };
