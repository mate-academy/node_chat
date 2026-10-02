/* eslint-disable no-console */
'use strict';

require('dotenv/config');

const cors = require('cors');
const express = require('express');

const { WebSocketServer } = require('ws');

const { setupWebSocket } = require('./ws/connection');
const PORT = process.env.PORT_BG || 3000;

const app = express();

app.use(express.json());
app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

setupWebSocket(wss);
