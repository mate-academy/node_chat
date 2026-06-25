'use strict';

const { createAppServer } = require('./server/createAppServer');

const PORT = process.env.PORT || 3000;

const server = createAppServer();

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chat server is running at http://localhost:${PORT}`);
});
