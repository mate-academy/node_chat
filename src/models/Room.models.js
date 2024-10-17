'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Room = sequelize.define(
  'room',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'room',
    updatedAt: false,
    createdAt: false,
  },
);
