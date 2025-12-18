import { DataTypes } from "sequelize";
import { client } from "../utils/bd.js";


export const User = client.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,

  },


});
