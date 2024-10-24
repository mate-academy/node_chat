/* eslint-disable no-console */
'use strict';

require('dotenv/config');

const { createServer } = require('./createServer');

const PORT = process.env.PORT || 3005;

createServer().listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
