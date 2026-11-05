'use strict';

const _require = require('sequelize');
const Sequelize = _require.Sequelize;

const utils = require('util'); // Needed for testing purposes, do not remove

const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

global.TextEncoder = utils.TextEncoder;

const _process$env = process.env;
const POSTGRES_HOST = _process$env.POSTGRES_HOST;
const POSTGRES_PORT = _process$env.POSTGRES_PORT;
const POSTGRES_USER = _process$env.POSTGRES_USER;
const POSTGRES_PASSWORD = _process$env.POSTGRES_PASSWORD;
const POSTGRES_DB = _process$env.POSTGRES_DB;
const sequelize = new Sequelize({
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: POSTGRES_PORT || 5432,
  password: POSTGRES_PASSWORD || '123',
});

module.exports = {
  sequelize: sequelize,
};
