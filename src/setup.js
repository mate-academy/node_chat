/* eslint-disable no-unused-vars */
'use strict';

const { client } = require('./utils/db');
const { User } = require('./models/User');
const { Room } = require('./models/Room');
const { Message } = require('./models/Message');

require('dotenv').config();

client.sync({ force: true });
