import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Room = sequelize.define('room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }
},
  {
    createdAt: false,
    updatedAt: false,
  }
);
