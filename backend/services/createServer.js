const express = require('express');
const http = require('http');
const routesApp = require('../routes');
require('dotenv/config');
var cors = require('cors');
const errorHandler = require('../middleware/errorHandler');
const { Server } = require('socket.io');
const axios = require('axios');
const createSocket = require('../socket/socket');

const PORT = process.env.PORT || 3000;

function createServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: `http://localhost:3000`,
      methods: ['GET', 'POST'],
    }
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }))

  routesApp(app);

  app.use(errorHandler);

  createSocket(io);

  server.listen(PORT)

  return server;
}

module.exports = createServer;
