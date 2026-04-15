/* eslint-disable no-console */
const http = require('http');
const { setupWebSocket } = require('./websocket');

const server = http.createServer();

setupWebSocket(server);

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
