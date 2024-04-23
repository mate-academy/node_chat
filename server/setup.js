require('dotenv/config');

const User = require('./src/models/user.js');
const Chat = require('./src/models/chat.js');
const Message = require('./src/models/message.js');
const { sequelize } = require('./src/db/db.js');

sequelize.sync({ force: true });
