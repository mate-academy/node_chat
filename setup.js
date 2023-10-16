/* eslint-disable no-unused-vars */
'use strict';

require('dotenv').config();

const { Chats } = require('./src/models/chats');
const { Messages } = require('./src/models/messages');
const { client } = require('./src/utils/db');

client.sync({ force: true });
