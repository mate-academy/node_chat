import { DataTypes } from "sequelize";
import { client } from "../utils/bd.js";
import { User } from "./user.js";

export const Rooms = client.define('rooms',{
  name: {
    type: DataTypes.STRING,
    allowNull:false
  },


})
Rooms.belongsTo(User);

