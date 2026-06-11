'use strict';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'main',
  process.env.DB_USER || 'vladok',
  process.env.DB_PASS || 'mytestdbpass1',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  },
);

module.exports = sequelize;
