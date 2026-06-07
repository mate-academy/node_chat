import { IncomingMessage, ServerResponse } from 'node:http';

export function setCorsHeaders(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const allowedOrigin = process.env.FE_URL;
  const requestOrigin = request.headers.origin;

  if (allowedOrigin && requestOrigin === allowedOrigin) {
    response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Vary', 'Origin');
  }
}

export function sendJson(
  request: IncomingMessage,
  response: ServerResponse,
  statusCode: number,
  payload: object,
) {
  setCorsHeaders(request, response);

  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}
