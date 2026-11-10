import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';
import { Room } from './room.js';

export const Message = client.define(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Room,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
    updatedAt: false,
  },
);

Message.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages',
});
