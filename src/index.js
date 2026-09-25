'use strict';

const http = require('http');
const { createServer } = require('./createServer');

const server = http.createServer();

createServer(server);

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on http://localhost:3000');
});
