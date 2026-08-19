'use strict';

const ALLOWED_METHODS = 'GET,POST,PATCH,DELETE,OPTIONS';

const setCorsHeaders = (request, response) => {
  const origin = request.headers && request.headers.origin;

  response.setHeader('Access-Control-Allow-Origin', origin || '*');
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
};

const sendJson = (request, response, statusCode, payload) => {
  const body = JSON.stringify(payload);

  setCorsHeaders(request, response);

  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
};

exports.setCorsHeaders = setCorsHeaders;
exports.sendJson = sendJson;
