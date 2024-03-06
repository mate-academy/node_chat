import { DataTypes } from 'sequelize';
import { sequelize } from '../store/sqlite.db.js';

import { Room } from './Room.model.js';

export const Message = sequelize.define('message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Room,
      key: 'id',
    }
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
});
