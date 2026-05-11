import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional
} from 'sequelize';
import { sequelize } from '../db/connection.js';
import type { ForeignKey } from 'sequelize';
import Room from './Room.js';


class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  declare id: CreationOptional<number>;
  declare text: string;
  declare author: string;
  declare roomId: ForeignKey<Room['id']>;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },

  {
    sequelize,
    tableName: 'messages',
  }
);

export default Message;
