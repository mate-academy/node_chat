'use strict';

require('dotenv').config();

const { sequelize } = require('./db.js');

require('../models/Room.js');
require('../models/Message.js');

sequelize.sync({ force: true });
