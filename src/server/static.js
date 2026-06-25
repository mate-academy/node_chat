'use strict';

const fs = require('fs/promises');
const path = require('path');

const { sendNotFound } = require('./http');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

const serveStatic = async (req, res, pathname, publicDir) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendNotFound(res);

    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(publicDir, requestedPath));

  if (!filePath.startsWith(publicDir)) {
    sendNotFound(res);

    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath);

    res.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Content-Length': content.length,
    });

    if (req.method === 'HEAD') {
      res.end();

      return;
    }

    res.end(content);
  } catch (error) {
    sendNotFound(res);
  }
};

module.exports = { serveStatic };
