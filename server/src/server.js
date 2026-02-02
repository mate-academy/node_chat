'use strict';

const express = require('express');
const cors = require('cors');
const http = require('http');
const setupSockets = require('./socket/events.js');
const { sequelize } = require('./db.js');
require('./models/associations');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
// eslint-disable no-console
const server = http.createServer(app);
setupSockets(server);

(async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync();
    console.log('db synced');

    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
      console.log('SERVER FILE LOADED');
    });
  } catch (error) {
    console.error(`Server start error:`, error);
    process.exit(1);
  }
})();


