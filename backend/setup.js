/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

require('dotenv').config();

const Message = require('./src/models/Message.model');
const User = require('./src/models/User.model');
const { client } = require('./src/utils/db');

const setup = async () => {
  try {
    await client.authenticate();
    console.log('Connection has been established successfully.');

    await client.sync({ force: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

setup();
