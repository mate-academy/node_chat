import { DataTypes } from 'sequelize';
import { client } from '../db.js';

export const User = client.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});
