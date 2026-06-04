const { Sequelize } = require('sequelize');

const client = new Sequelize({
  host: 'localhost',
  username: 'postgres',
  password: '123123',
  database: 'postgres',
  port: Number(2121),
  dialect: 'postgres',
});

module.exports = {
  client,
};
