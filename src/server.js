import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3001;

export const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use(cors());

  const emitter = new EventEmitter();

  const messages = [];

  app.post('/messages', (req, res) => {
    const { text } = req.body;

    const message = {
      text,
      createdAt: new Date(),
    };

    messages.push(message);

    emitter.emit('message', message);

    res.status(201).send(messages);
  });

  app.get('/messages', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');

    const cb = (message) => {
      res.write(`data: ${JSON.stringify(message)}` + '\n\n');
    };

    emitter.on('message', cb);

    res.on('close', () => {
      emitter.off('message', cb);
    });

    // eslint-disable-next-line no-console
    console.log(emitter.listenerCount('message'));
  });

  //   for (const routeKey in routes) {
  //     app.use(`/${routeKey}`, routes[routeKey]);
  //   }

  app.use('{*path}', (req, res, next) => {
    res.status(404).send('Not Found');
  });

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.log(err);

    if (res.headersSent) {
      return next(err);
    }

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    res.status(statusCode).send(message);
  });

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (text) => {
      const message = {
        text: text.toString(),
        createdAt: new Date(),
      };

      messages.push(message);

      emitter.emit('message', message);
    });
  });

  emitter.on('message', (message) => {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  });
};
