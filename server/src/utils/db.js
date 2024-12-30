'use strict';

const { Sequelize } = require('sequelize');
const utils = require('util');

global.TextEncoder = utils.TextEncoder;

const sequelize = new Sequelize({
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  dialect: process.env.POSTGRES_DIALECT,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASSWORD,
});

module.exports = {
  sequelize,
};
