const path = require('path');
const express = require('express');
const cors = require('cors');
const messagesRoutes = require('./routes/messages.routes');

require('dotenv').config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/messages', messagesRoutes);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
