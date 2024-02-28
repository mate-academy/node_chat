import "dotenv/config";
import { sequelize } from "./src/db.js";
import { Message } from "./src/models/Message.js";
import { Room } from "./src/models/Room.js";

sequelize.sync({ force: true });
