require('dotenv').config();

/* eslint-disable no-console */
const config = {
  development: {
    username: process.env.DB_USER || 'dev_user',
    password: process.env.DB_PASS || 'dev_pass',
    database: process.env.DB_NAME || 'dev_db',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASS || 'test_pass',
    database: process.env.DB_NAME || 'test_db',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER || 'prod_user',
    password: process.env.DB_PASS || 'prod_pass',
    database: process.env.DB_NAME || 'prod_db',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  },
};

module.exports = config;
