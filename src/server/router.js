const routes = require('./routes');
const { httpError } = require('../utils/errors');

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');

  for (const [method, pattern, handler] of routes) {
    if (req.method !== method) {
      continue;
    }

    const match = url.pathname.match(pattern);

    if (match) {
      return handler({
        req,
        res,
        url,
        params: match.slice(1),
      });
    }
  }

  throw httpError(404, 'Rota não encontrada.');
}

module.exports = { handle };
