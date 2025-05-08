import { db } from './utils/db';

import { createApp } from './createApp';
import { createWss } from './wss/createWss';

import { messageEmitter } from './emitters/message.emitter';
import closeWithGrace, { CloseWithGraceCallback } from 'close-with-grace';

const app = createApp();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log('Server is running.'));
const wss = createWss(server);

const cb: CloseWithGraceCallback = async ({ err, signal }) => {
  if (err) {
    console.error('Closing server with error', err);
  } else {
    console.log(`${signal} received, closing server`);
  }

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((closeErr) => {
        if (closeErr) {
          reject(closeErr);
        } else {
          resolve();
        }
      });
    });
    console.log('HTTP server closed');

    await db.$disconnect();
    console.log('Database closed');
    messageEmitter.removeAllListeners();

    await new Promise<void>((resolve, reject) => {
      wss.close((wsErr) => {
        if (wsErr) {
          reject(wsErr);
        } else {
          resolve();
        }
      });
    });

    console.log('WebSocket server closed');
    console.log('Server is closed');
  } catch (error) {
    console.error('Error during shutdown process:', error);
  }
};

closeWithGrace({ delay: 10000 }, cb);
