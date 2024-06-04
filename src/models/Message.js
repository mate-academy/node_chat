import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { User } from './User.js';
import { Room } from './Room.js';

export const Message = sequelize.define('messages', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasMany(Message);
Message.belongsTo(User);

Room.hasMany(Message);
Message.belongsTo(Room);
