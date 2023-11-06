require('dotenv').config();
const { Message } = require('./models/messages');

Message.sync({force: true});
