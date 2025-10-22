import { EventEmitter } from 'events';

const emitter = new EventEmitter();

export const GET = (event, req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  const cb = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  emitter.on(event, cb);

  res.on('close', () => {
    emitter.off(event, cb);
  });
};
