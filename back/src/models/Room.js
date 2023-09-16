import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db.js";

export const Room = sequelize.define("room", {
  name: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
  },
});
