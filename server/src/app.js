const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const messages = require('./routes/messages');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', messages);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
