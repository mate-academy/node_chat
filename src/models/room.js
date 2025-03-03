import { sequelize } from '../utils/db.js';
import { DataTypes } from 'sequelize';
import { User } from './user.js';

export const Room = sequelize.define('room', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Room.belongsTo(User);
User.hasMany(Room);
