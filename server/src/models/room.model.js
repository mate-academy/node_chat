import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Room = client.define(
  'room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
    timestamps: false,
  },
);
