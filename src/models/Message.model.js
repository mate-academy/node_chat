import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';
import { Room } from './Room.model.js';

export const Message = client.define('message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(Room);
Room.hasOne(Message);
