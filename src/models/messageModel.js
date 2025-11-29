'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
// import User from './userModel.js';
// import Room from './roomModel.js';

export const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // // Foreign keys:
    // userId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'users',
    //     key: 'id',
    //   },
    // },
    // roomId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'rooms',
    //     key: 'id',
    //   },
    // },
  },
  {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

// // Define relationships:
// User.hasMany(Message, { foreignKey: 'userId' });
// Message.belongsTo(User, { foreignKey: 'userId' });

// Room.hasMany(Message, { foreignKey: 'roomId' });
// Message.belongsTo(Room, { foreignKey: 'roomId' });

export default Message;
