import { DataTypes } from "sequelize";
import { client } from "../utils/bd.js";
import { User } from "./user.js";
import { Rooms } from "./rooms.js";

export const Message = client.define('message', {

  text: {
    type: DataTypes.STRING,
    allowNull:false
  },
  userName: {
    type:DataTypes.STRING,
    allowNull:false
  }

})
Message.belongsTo(User);
Message.belongsTo(Rooms);
