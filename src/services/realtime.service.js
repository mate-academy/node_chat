/** Conexões Server-Sent Events e broadcast de eventos. */
const config = require('../config');

const clients = new Set();

function emit(res, event, data) {
  res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n');
}

function addClient(req, res, initialEvent) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 2000\n\n');
  clients.add(res);
  req.on('close', () => clients.delete(res));

  if (initialEvent) {
    emit(res, initialEvent.name, initialEvent.data);
  }
}

function broadcast(event, data) {
  for (const res of clients) {
    emit(res, event, data);
  }
}

function startHeartbeat() {
  setInterval(() => {
    for (const res of clients) {
      res.write(': ping\n\n');
    }
  }, config.HEARTBEAT_MS).unref();
}

module.exports = { addClient, broadcast, startHeartbeat };
