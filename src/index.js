'use strict';

const { createServer } = require('./createServer');

const PORT = 5700;

createServer().listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`Server is running on localhost:${PORT}`);
});
