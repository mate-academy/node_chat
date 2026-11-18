'use strict';

const express = require('express');
const cors = require('cors');
const router = require('./routers/rooms.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello world' });
});

app.use('/rooms', router);

module.exports = app;
