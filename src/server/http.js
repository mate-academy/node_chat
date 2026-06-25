'use strict';

const { createHttpError } = require('../utils/errors');

const MAX_BODY_SIZE = 32_000;

const setSecurityHeaders = (res) => {
  const csp = [
    "default-src 'self'",
    "connect-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', csp);
};

const sendJson = (res, statusCode, data) => {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const sendNotFound = (res) => {
  sendJson(res, 404, { error: 'Not found' });
};

const sendMethodNotAllowed = (res) => {
  sendJson(res, 405, { error: 'Method not allowed' });
};

const sendSse = (res, event, payload) => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';

    if (!contentType.includes('application/json')) {
      reject(createHttpError(400, 'Content-Type must be application/json'));

      return;
    }

    let body = '';

    req.on('data', (chunk) => {
      body += chunk;

      if (body.length > MAX_BODY_SIZE) {
        reject(createHttpError(413, 'Request body is too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});

        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(createHttpError(400, 'Invalid JSON'));
      }
    });

    req.on('error', reject);
  });

module.exports = {
  readJsonBody,
  sendJson,
  sendMethodNotAllowed,
  sendNotFound,
  sendSse,
  setSecurityHeaders,
};
