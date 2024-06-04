import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';
import { Room } from './Room.js';

export const User = sequelize.define('chatusers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

User.belongsToMany(Room, { through: 'roomUsers' });
Room.belongsToMany(User, { through: 'roomUsers' });
