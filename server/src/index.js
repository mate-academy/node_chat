import 'dotenv/config';
import app from './app.js';
import { createServer } from 'http';
import setupWebSocket from './websocket/websocket.js';
import { sequelize } from './config/db.js';
import './models/index.js';

const PORT = process.env.PORT || 3000;
const server = createServer(app);

setupWebSocket(server);

const start = async () => {
  await sequelize.sync();

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started at ${PORT}`);
  });
};

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
