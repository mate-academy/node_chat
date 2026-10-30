const http = require('http');
const router = require('./router');
const logger = require('../utils/logger');
const { sendJSON } = require('../utils/http');

function createApp() {
  return http.createServer((req, res) => {
    Promise.resolve()
      .then(() => router.handle(req, res))
      .catch((err) => {
        if (res.headersSent) {
          return res.end();
        }

        if (!err.status) {
          logger.error(err);
        }

        sendJSON(res, err.status || 500, {
          error: err.status ? err.message : 'Erro interno do servidor.',
        });
      });
  });
}

module.exports = { createApp };
