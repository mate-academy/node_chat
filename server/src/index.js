'use strict';

require('dotenv').config();
const { createServer } = require('./createServer');

const { initializeWSS } = require('./wss');

const port = process.env.SERVER_PORT || 5700;

const server = createServer().listen(port, () => {
  console.log(`Server is running on localhost: ${port}`);
});

initializeWSS(server);
