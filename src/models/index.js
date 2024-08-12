import Sequelize from 'sequelize';
import { User, initialization as initUser } from './user.js';
import { Room, initialization as initRoom } from './rooms.js';
import { Message, initialization as initMessage } from './messages.js';
import * as UsersRooms from './usersRooms.js';

const config = {
  database: process.env.DB_DB,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'postgres',
};

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  },
);

let model = initUser(sequelize, Sequelize.DataTypes);
db[model.name] = model;
model = initRoom(sequelize, Sequelize.DataTypes);
db[model.name] = model;
model = UsersRooms.initialization(sequelize, Sequelize.DataTypes);
db[model.name] = model;
model = initMessage(sequelize, Sequelize.DataTypes);
db[model.name] = model;

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export {
  User,
  Room,
  Message,
  sequelize,
};
