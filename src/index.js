/* eslint-disable no-console */

/* eslint-disable no-console */
'use strict';

import './setup.js';
import http from 'http';
import { createServer } from './createServer.js';
import { initWebSocket } from './wsServer.js';

// create express app
const app = createServer();

// create http server
const server = http.createServer(app);

// initialize websocket server
initWebSocket(server);

// start server (http + websocket)
server.listen(5000, () => {
  console.log('Server is running on localhost:5000');
});
