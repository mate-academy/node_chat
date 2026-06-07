'use strict';

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';

import { router } from './router';
import { setCorsHeaders, sendJson } from './utils/utils';

const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_FILE = 'index.html';

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
};

function sendNoContent(request: IncomingMessage, response: ServerResponse) {
  setCorsHeaders(request, response);

  response.writeHead(204, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Content-Length': '0',
  });
  response.end();
}

function resolvePublicPath(urlPathname: string) {
  const normalizedPath = urlPathname === '/' ? `/${DEFAULT_FILE}` : urlPathname;
  const safeRelativePath = path
    .normalize(normalizedPath)
    .replace(/^(\.\.[/\\])+/, '');

  return path.join(PUBLIC_DIR, safeRelativePath);
}

async function serveStaticFile(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
) {
  const filePath = resolvePublicPath(pathname);
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

    const extension = path.extname(filePath);
    const contentType: string =
      CONTENT_TYPES[extension] || 'application/octet-stream';

    response.writeHead(200, {
      'Content-Type': contentType,
    });

    createReadStream(filePath).pipe(response);

    return true;
  } catch {
    return false;
  }
}

async function requestListener(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const method = request.method || 'GET';
  const url = new URL(request.url || '/', 'http://localhost');
  const { pathname } = url;

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
}

const app = createServer((request, response) => {
  void requestListener(request, response);
});

export default app;
