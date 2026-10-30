const fs = require('fs');
const path = require('path');
const config = require('../config');
const renderPage = require('../views/page');
const { sendHTML, sendJS } = require('../utils/http');
const { httpError } = require('../utils/errors');

function index({ res }) {
  sendHTML(res, renderPage());
}

/** Entrega os módulos JS do cliente (src/client/**). Só aceita arquivos .js. */
function clientAsset({ res, params }) {
  return new Promise((resolve, reject) => {
    let relative;

    try {
      relative = decodeURIComponent(params[0]);
    } catch (_) {
      return reject(httpError(400, 'Caminho inválido.'));
    }

    const full = path.join(config.CLIENT_DIR, path.normalize(relative));

    if (
      !full.startsWith(config.CLIENT_DIR + path.sep) ||
      path.extname(full) !== '.js'
    ) {
      return reject(httpError(404, 'Arquivo não encontrado.'));
    }

    fs.readFile(full, 'utf8', (err, code) => {
      if (err) {
        return reject(httpError(404, 'Arquivo não encontrado.'));
      }
      sendJS(res, code);
      resolve();
    });
  });
}

module.exports = { index, clientAsset };
