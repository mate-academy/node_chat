import { DataTypes } from 'sequelize';

import { client } from '../utils/db.js';

export const Message = client.define('message', {
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
      onDelete: 'CASCADE',
    },
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rooms',
      key: 'id',
      onDelete: 'CASCADE',
    },
  },
});
