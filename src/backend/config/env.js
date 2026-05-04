/* eslint-disable indent */
'use strict';

const path = require('path');
const fs = require('fs');

const envPath =
  [
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '..', 'server', '.env'),
    path.resolve(__dirname, '..', '..', '..', 'server', '.env'),
  ].find((filePath) => fs.existsSync(filePath)) ||
  path.resolve(__dirname, '..', '.env');

require('dotenv').config({
  path: envPath,
  quiet: true,
});

const databaseUrl =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/node_chat';

const shouldUseSsl =
  databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech');

module.exports = {
  databaseUrl,
  shouldUseSsl,
};
