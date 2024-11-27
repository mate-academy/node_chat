import { DataTypes, UUIDV4 } from "sequelize";
import { client } from "../utils/db.js";

export const Room = client.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    unique: true,
    primaryKey: true,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
