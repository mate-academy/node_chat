/* eslint-disable quotes */
import "dotenv/config";
import { sequelize } from "./utils/db.js";
import "./models/user.js";
import "./models/Room.js";
import "./models/Message.js";

sequelize.sync({ force: true });
