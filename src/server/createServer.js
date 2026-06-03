'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { ChatStore } = require('./chatStore');
const { attachWebSocket } = require('./wsHandler');

const CLIENT_DIR = path.join(__dirname, '../client');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(
    CLIENT_DIR,
    urlPath.replace(/^\/+/, '').replace(/\.\./g, '') || 'index.html',
  );

  if (!filePath.startsWith(CLIENT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');

    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');

      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function createServer(port = 3000) {
  const store = new ChatStore();
  const clients = new Set();

  const server = http.createServer(serveStatic);
  const wss = new WebSocketServer({ server });

  attachWebSocket({ wss, clients, store });

  return {
    start() {
      server.listen(port);
    },
    server,
    wss,
    store,
    clients,
  };
}

module.exports = { createServer };
