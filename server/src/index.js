('use strict');
require('dotenv').config();

const http = require('http');

const app = require('./app');
const { setupWebSocket } = require('./controllers/ws.controller');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});

setupWebSocket(server);
