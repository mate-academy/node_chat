import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';

const Message = client.define(
  'message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    updatedAt: false,
  },
);

module.exports = {
  Message,
};

Message.belongsTo(User);
User.hasMany(Message);
Message.belongsTo(Room);
Room.hasMany(Message);
