import { createServer } from './createServer.js';
import dotenv from 'dotenv';
import { initWebSocket } from './socket/wss.js';

dotenv.config();

export const app = createServer();
const port = process.env.PORT ?? 3000;

const server = app.listen(port, () => {
  console.log(`Server activated on: ${port}`);
});

initWebSocket(server);