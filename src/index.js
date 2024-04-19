/* eslint-disable no-console */
'use strict';

const { createServer } = require('./utils/createServer');
const { createWS } = require('./utils/createWS');

require('dotenv').config();

const server = createServer().listen(process.env.PORT, () => {
  console.log('Server is listening...');
});

createWS(server);
