'use strict';
import 'dotenv/config';

import { createServer } from './createServer.js';
import { initWebSocket } from './webSoketConection.js';

export const server = createServer();

initWebSocket(server);
