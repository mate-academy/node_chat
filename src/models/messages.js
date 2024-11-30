import { Room } from './room.js';
import DataTypes from 'sequelize';
import { client } from '../db.js';

export const Message = client.define('messages', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
  },
});

Message.belongsTo(Room);
Room.hasMany(Message);
