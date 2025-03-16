import { DataTypes, NOW } from 'sequelize';
import { client } from '../db/db';
import { Room } from './Room.model';

export const Message = client.define('message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
    defaultValue: NOW,
  },
});

Message.belongsTo(Room);
Room.hasMany(Message);
