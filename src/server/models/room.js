import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const Room = client.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
  },
);
