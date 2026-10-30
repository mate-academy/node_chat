/**
 * Ponto de entrada.  Uso:  node src/index.js
 */
const config = require('./config');
const logger = require('./utils/logger');
const roomsRepository = require('./repositories/rooms.repository');
const realtime = require('./services/realtime.service');
const { createApp } = require('./server/app');

roomsRepository.load();
realtime.startHeartbeat();

createApp().listen(config.PORT, () => {
  logger.info('Chat rodando em http://localhost:' + config.PORT);
});
