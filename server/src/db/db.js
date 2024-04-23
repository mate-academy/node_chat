/* eslint-disable no-console */
const { Sequelize } = require('sequelize');

require('dotenv/config');

const sequelize = new Sequelize({
  host: 'localhost',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});

const checkDBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Socket connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  checkDBConnection,
};
