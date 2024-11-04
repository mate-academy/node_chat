const { Sequelize } = require('sequelize');

const client = new Sequelize({
  username: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
});

module.exports = { client };
