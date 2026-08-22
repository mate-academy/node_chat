import { v4 } from 'uuid';
import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: v4,
    primaryKey: true,
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
});

export default Message;
