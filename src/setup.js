/* eslint-disable no-unused-vars */
'use strict';

const { db } = require('./utils/db.js');
const { User } = require('./models/User.js');
const { Chat } = require('./models/Chat.js');
const { Message } = require('./models/Message.js');

db.sync({ force: true });
