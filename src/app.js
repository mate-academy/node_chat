'use strict';

const { createReadStream } = require('node:fs');
const { stat } = require('node:fs/promises');
const { createServer } = require('node:http');
const path = require('node:path');

const { router } = require('./router');
const { sendJson, setCorsHeaders } = require('./utils/utils');

const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_FILE = 'index.html';
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
};

const sendNoContent = (request, response) => {
  setCorsHeaders(request, response);

  response.writeHead(204, {
    'Content-Length': '0',
  });
  response.end();
};

const resolvePublicPath = (urlPathname) => {
  const normalizedPath = urlPathname === '/' ? `/${DEFAULT_FILE}` : urlPathname;
  const decodedPath = decodeURIComponent(normalizedPath);
  const relativePath = decodedPath.replace(/^[/\\]+/, '');

  return path.resolve(PUBLIC_DIR, relativePath);
};

const serveStaticFile = async (request, response, pathname) => {
  let filePath;

  try {
    filePath = resolvePublicPath(pathname);
  } catch {
    sendJson(request, response, 400, { error: 'Invalid path' });

    return true;
  }

  const relativePath = path.relative(PUBLIC_DIR, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    sendJson(request, response, 403, { error: 'Forbidden' });

    return true;
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return false;
    }

    const contentType =
      CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream';

    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileStat.size,
    });
    createReadStream(filePath).pipe(response);

    return true;
  } catch {
    return false;
  }
};

const requestListener = async (request, response) => {
  const method = request.method || 'GET';
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const { pathname } = requestUrl;

  if (method === 'OPTIONS') {
    sendNoContent(request, response);

    return;
  }

  if (method === 'GET') {
    const fileServed = await serveStaticFile(request, response, pathname);

    if (fileServed) {
      return;
    }
  }

  const handled = await router(method, pathname, request, response);

  if (handled) {
    return;
  }

  sendJson(request, response, 404, { error: 'Not found' });
};

const app = createServer((request, response) => {
  requestListener(request, response).catch(() => {
    if (!response.headersSent) {
      sendJson(request, response, 500, { error: 'Internal server error' });
    } else {
      response.end();
    }
  });
});

module.exports = app;
