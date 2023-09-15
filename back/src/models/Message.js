import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db.js";
import { User } from "./user.js";
import { Room } from "./Room.js";

export const Message = sequelize.define("message", {
  authorName: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
  },
});

Message.belongsTo(User);
Message.belongsTo(Room);
