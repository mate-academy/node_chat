'use strict';

require('dotenv/config');

const app = require('./app');
const roomsService = require('./services/roomsService');
const { initRealtime } = require('./realtime');

const PORT = process.env.PORT || 4000;

async function start() {
  await roomsService.ensureDefaultRoom();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  initRealtime(server);
}

start();
