import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const Message = sequelize.define(
  'Messages',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
    createdAt: 'createdAt',
    updatedAt: false,
  },
);
