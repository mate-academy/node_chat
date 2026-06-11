/* eslint-disable no-shadow */
/* eslint-disable no-console */
// eslint-disable-next-line prettier/prettier
require('dotenv').config();

require('./models/associations.js');

const http = require('http');
const express = require('express');
const cors = require('cors');
const ws = require('ws');

const { client } = require('./db.js');
const { routerApp } = require('./router/index.js');

const app = express();

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);

const server = http.createServer(app);
const wss = new ws.Server({ server });

app.use('/api', routerApp);

wss.on('connection', function (ws) {
  ws.on('message', function (data) {
    const jsonData = JSON.parse(data);

    for (const client of wss.clients) {
      client.send(
        JSON.stringify({
          author: jsonData.author,
          text: jsonData.text,
        }),
      );
    }
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await client.authenticate();
    console.log('DB connected');
    await client.sync({ alter: true });
    console.log('Tables Created');

    server.listen(PORT, () => {
      console.log(`Server Started on Port 5000`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
