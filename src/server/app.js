const express = require('express');
const path = require('path');
const roomsController = require('./controllers/roomsController');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client')));
app.use('/shared', express.static(path.join(__dirname, '../../shared')));
app.get('/api/rooms', roomsController.getRooms);
app.post('/api/rooms', roomsController.createRoom);

app.use((_err, req, res, next) => {
  res.status(500).send('Щось пішло не так на сервері!');
});

module.exports = app;
