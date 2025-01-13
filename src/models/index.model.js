import Sequelize from 'sequelize';
import { User, initialization as initUser } from './user.model.js';
import { Room, initialization as initRoom } from './rooms.model.js';
import { Message, initialization as initMessage } from './messages.model.js';
import * as UsersRooms from './usersRooms.model.js';

const config = {
  database: process.env.DB_NAME || 'default_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
  },
);

const db = {};

const models = [
  { init: initUser, modelExport: User },
  { init: initRoom, modelExport: Room },
  { init: initMessage, modelExport: Message },
  { init: UsersRooms.initialization, modelExport: null },
];

models.forEach(({ init, modelExport }) => {
  const model = init(sequelize, Sequelize.DataTypes);

  db[model.name] = model;

  if (modelExport && modelExport.name) {
    db[modelExport.name] = modelExport;
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { User, Room, Message, sequelize };
