import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const Message = sequelize.define(
  'Message',
  {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
  },
);
