const config = require('../config');
const { httpError } = require('./errors');

function send(res, status, contentType, body) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

const sendJSON = (res, status, body) =>
  send(res, status, 'application/json; charset=utf-8', JSON.stringify(body));
const sendHTML = (res, html) =>
  send(res, 200, 'text/html; charset=utf-8', html);
const sendJS = (res, code) =>
  send(res, 200, 'text/javascript; charset=utf-8', code);

function readJSON(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;

      if (size > config.limits.bodyBytes) {
        reject(httpError(413, 'Requisição grande demais.'));
        req.destroy();

        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');

        resolve(raw ? JSON.parse(raw) : {});
      } catch (_) {
        reject(httpError(400, 'JSON inválido.'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = {
  sendJSON,
  sendHTML,
  sendJS,
  readJSON,
};
