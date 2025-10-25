import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.model.js';

export const Room = client.define('room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Room.belongsTo(User);
User.hasMany(Room);
