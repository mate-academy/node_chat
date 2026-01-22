'use strict';

const http = require('node:http');
const app = require('./server/app');
const config = require('./server/config/default');
const setupSockets = require('./server/sockets');

const server = http.createServer(app);
const PORT = config.port || 3000;
const io = setupSockets(server);

app.set('io', io);

server.listen(PORT, () => {
  /* eslint-disable no-console */

  console.log(`Сервер запущено на порту: ${PORT}`);
});
