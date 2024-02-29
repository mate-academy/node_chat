import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { Room } from "./Room.js";

export const Message = sequelize.define('message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(Room, {
  onDelete: 'CASCADE',
  hooks: true
});

Room.hasMany(Message, {
  onDelete: 'CASCADE',
  hooks: true
});
