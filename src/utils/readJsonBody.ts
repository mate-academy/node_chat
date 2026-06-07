import { IncomingMessage } from 'node:http';

const MAX_BODY_SIZE_BYTES = 1024 * 1024;

export async function readJsonBody<T>(
  request: IncomingMessage,
): Promise<T | null> {
  const chunks: Buffer[] = [];
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

  return JSON.parse(rawBody) as T;
}
