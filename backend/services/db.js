const { Sequelize } = require('sequelize');
require('dotenv/config');

const {
  PG_DATABASE,
  PG_USERNAME,
  PG_PASSWORD,
  PG_LOCALHOST,
  PG_DIALECT,
  PG_PORT
} = process.env;

const sequelize = new Sequelize(PG_DATABASE, PG_USERNAME, PG_PASSWORD, {
  port: PG_PORT,
  host: PG_LOCALHOST,
  dialect: PG_DIALECT
});

module.exports = {
  sequelize,
}
