import { sequelize } from '../utils/db.js';
import { DataTypes } from 'sequelize';
import { User } from './user.js';
import { Room } from './room.js';

export const Message = sequelize.define('message', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(User);
User.hasMany(Message);
Message.belongsTo(Room);
Room.hasMany(Message);
