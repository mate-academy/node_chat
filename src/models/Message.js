import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { Room } from './Room.js';

export const Message = client.define(
  'Message',
  {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Room,
        key: 'id',
      },
    },
  },
  {
    tableName: 'messages',
    timestamps: false,
  },
);

Message.belongsTo(Room, { foreignKey: 'roomId' });
Room.hasMany(Message, { foreignKey: 'roomId' });
