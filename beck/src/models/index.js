/* eslint-disable no-console */
require('dotenv').config({ path: '../../.env' });

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  password: process.env.POSTGRES_PASSWORD || '69301410',
  dialect: 'postgres',
});

Sequelize.postgres.DECIMAL.parse = (value) => parseFloat(value);

sequelize
  .sync({ force: false })
  .then(() => console.log('База даних підключена'))
  .catch((err) => console.log('Помилка підключення до бази даних', err));

module.exports = {
  sequelize,
};
