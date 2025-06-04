import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js'

export const User = sequelize.define(
  'Users',
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
  },
  { tableName: 'users', updatedAt: false, createdAt: false },
);
