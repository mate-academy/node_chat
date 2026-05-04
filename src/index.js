/* eslint-disable no-console */
'use strict';
import { createServer } from './app.js';

const PORT = 3000;

const { httpServer } = createServer();

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
