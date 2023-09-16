/* eslint-disable quotes */
import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db.js";

export const User = sequelize.define("user", {
  fullName: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
  },
});
