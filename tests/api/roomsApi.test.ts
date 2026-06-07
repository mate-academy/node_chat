import type { AddressInfo } from 'node:net';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let appModule: typeof import('../../src/app.js');
let server: import('node:http').Server | null = null;
let baseUrl = '';

async function startServer() {
  vi.resetModules();
  appModule = await import('../../src/app.js');

  await new Promise<void>((resolve) => {
    server = appModule.default.listen(0, '127.0.0.1', () => {
      const address = server?.address() as AddressInfo;

      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
}

async function stopServer() {
  if (!server) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server?.close((error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve();
    });
  });

  server = null;
  baseUrl = '';
}

describe('rooms API', () => {
  beforeEach(async () => {
    await startServer();
  });

  afterEach(async () => {
    await stopServer();
  });

  it('returns the default room list', async () => {
    const response = await fetch(`${baseUrl}/rooms`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      rooms: [
        {
          id: 'general',
          name: 'General',
          messages: [],
        },
      ],
    });
  });

  it('creates a room and returns it from the list', async () => {
    const createResponse = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Backend' }),
    });
    const created = await createResponse.json();

    const listResponse = await fetch(`${baseUrl}/rooms`);
    const listData = await listResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created.room).toMatchObject({
      name: 'Backend',
      messages: [],
    });
    expect(listData.rooms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.room.id,
          name: 'Backend',
          messages: [],
        }),
      ]),
    );
  });

  it('adds a message to a room through the messages endpoint', async () => {
    const createResponse = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Backend' }),
    });
    const created = await createResponse.json();

    const messageResponse = await fetch(
      `${baseUrl}/rooms/${created.room.id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: 'Serhii',
          text: 'Hello room',
        }),
      },
    );
    const messageData = await messageResponse.json();

    const roomResponse = await fetch(`${baseUrl}/rooms/${created.room.id}`);
    const roomData = await roomResponse.json();

    expect(messageResponse.status).toBe(201);
    expect(messageData.message).toMatchObject({
      author: 'Serhii',
      text: 'Hello room',
    });
    expect(messageData.message.time).toEqual(expect.any(String));
    expect(roomData.room.messages).toEqual([messageData.message]);
  });
});
