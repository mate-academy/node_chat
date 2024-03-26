'use strict';

require('dotenv/config');

const { Sequelize } = require('sequelize');

const db = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  logging: false,
});

module.exports = { db };
