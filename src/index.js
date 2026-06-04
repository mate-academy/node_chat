/* eslint-disable no-console */
// eslint-disable-next-line prettier/prettier
require('dotenv').config();

require('./models/associations.js');

const express = require('express');
const cors = require('cors');
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

app.use('/api', routerApp);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await client.authenticate();
    console.log('DB connected');
    await client.sync({ alter: true });
    console.log('Tables Created');

    app.listen(PORT, () => {
      console.log(`Server Started on Port 5000`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
