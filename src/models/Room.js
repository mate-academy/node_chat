import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from '../models/User.js';

const Room = client.define('room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUID4,
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

module.exports = { Room };

Room.belongsTo(User);
User.hasMany(Room);
