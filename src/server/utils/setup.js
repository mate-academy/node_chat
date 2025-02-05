/* eslint-disable no-unused-vars */
require('dotenv').config();

const { User } = require('../models/user.model.js');
const { Room } = require('../models/room.model.js');
const { Message } = require('../models/message.model.js');
const { client } = require('./db.js');

client.sync({ force: true });
