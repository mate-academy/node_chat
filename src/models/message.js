import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.js';
import { Room } from './room.js';

export const Message = client.define(
  'message',
  {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
);

Message.belongsTo(User);
User.hasMany(Message);
Message.belongsTo(Room);
Room.hasMany(Message);
