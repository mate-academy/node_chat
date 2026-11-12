import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define(
  'Message',
  {
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'room_id',
    },

    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'messages',
    timestamps: false,
  },
);

export default Message;
