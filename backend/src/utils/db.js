const { Sequelize } = require('sequelize');

require('dotenv').config();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const client = new Sequelize({
  dialect: 'postgres',
  username: DB_USER || 'postgres',
  password: DB_PASSWORD || 'postgres',
  host: DB_HOST || 'localhost',
  port: DB_PORT || 5432,
  database: DB_NAME || 'postgres',
});

module.exports = {
  client,
};
