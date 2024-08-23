const express = require('express');
const cors = require('cors');
const { userRouter } = require('./routes/user.route.js');
const { messageRouter } = require('./routes/message.route.js');
const { roomRouter } = require('./routes/room.route.js');
const { WebSocketServer } = require('ws');
const { emitter } = require('./controllers/message.controller.js');

const app = express();

app.use(express.json());
app.use(cors());

app.use(userRouter);
app.use(messageRouter);
app.use(roomRouter);

app.use((req, res) => {
  res.status(404).send('Page not found');
});

const server = app.listen(3005);

const wss = new WebSocketServer({ server });

emitter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});
