const Sequelize = require('sequelize');

const client = new Sequelize({
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  password: process.env.POSTGRES_PASSWORD || '123',
});

module.exports = {
  client,
};
