/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { bindWSToServer } = require('./chat');
const messages = require('./messages');

const PORT = 3003;

const app = express();
const jsonParser = bodyParser.json();

app.use(cors());

app.get('/rooms', (req, res) => {
  res.send(JSON.stringify(messages.getAllRooms()));
});

app.get('/rooms/:id', (req, res) => {
  res.send(JSON.stringify(messages.getAllMessages(req.params.id)));
});

app.post('/rooms', (req, res) => {
  res.send(JSON.stringify(messages.createRoom()));
});

app.delete('/rooms/:id', (req, res) => {
  messages.deleteRoom(req.params.id);

  res.status(204).send('DELETED');
});

app.patch('/rooms/:id', jsonParser, (req, res) => {
  const { name } = req.body;

  messages.updateRoom(req.params.id, name);

  res.status(204).send('UPDATED');
});

const server = app.listen(PORT);

bindWSToServer(server);

console.log(`Server listening on port ${PORT}`);
