import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from './user.js';

export const Room = client.define('room', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  participants: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
});

Room.belongsTo(User);
User.hasMany(Room);
