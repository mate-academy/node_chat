'use strict';

const { createServer } = require('./server/createServer');

const PORT = Number(process.env.PORT) || 3000;

createServer(PORT).start();
