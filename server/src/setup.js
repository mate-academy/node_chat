'use strict';

const { Message } = require('./models/Message');
const { Room } = require('./models/Room');

Message.sync({ force: true });
Room.sync({ force: true });
