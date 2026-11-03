'use strict';

var _require = require('sequelize'),
    Sequelize = _require.Sequelize;

var utils = require('util'); // Needed for testing purposes, do not remove


var path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

global.TextEncoder = utils.TextEncoder;
var _process$env = process.env,
    POSTGRES_HOST = _process$env.POSTGRES_HOST,
    POSTGRES_PORT = _process$env.POSTGRES_PORT,
    POSTGRES_USER = _process$env.POSTGRES_USER,
    POSTGRES_PASSWORD = _process$env.POSTGRES_PASSWORD,
    POSTGRES_DB = _process$env.POSTGRES_DB;
var sequelize = new Sequelize({
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: POSTGRES_PORT || 5432,
  password: POSTGRES_PASSWORD || '123'
});
module.exports = {
  sequelize: sequelize
};