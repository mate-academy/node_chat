const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = http.createServer(app);
const socketHandler = require('./ws/socketHandler');
const wss = new WebSocket.Server({ server });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
})

wss.on('connection', socketHandler);

app.get('/', (req, res) => {
  res.send('WebSocket Chat Server is running');
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});
