import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js'

export const Room = sequelize.define(
  'Rooms',
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2, // min count of users in one room
    },
    users: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: false,
    },
  },
  { tableName: 'rooms', updatedAt: false, createdAt: false },
);
