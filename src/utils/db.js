const { Sequelize } = require('sequelize');

require('dotenv/config');

const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
});

module.exports = { client };
