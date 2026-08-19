'use strict';

const MAX_BODY_SIZE_BYTES = 1024 * 1024;

async function readJsonBody(request) {
  const chunks = [];
  let bodySize = 0;

  for await (const chunk of request) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

    bodySize += bufferChunk.length;

    if (bodySize > MAX_BODY_SIZE_BYTES) {
      throw new Error('Request body is too large');
    }

    chunks.push(bufferChunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  const rawBody = Buffer.concat(chunks).toString('utf-8').trim();

  if (!rawBody) {
    return null;
  }

  return JSON.parse(rawBody);
}

exports.readJsonBody = readJsonBody;
