'use strict';

const { Sequelize } = require('sequelize');
const connectionString = process.env.CONNECTION_STRING;
const client = new Sequelize(connectionString);

module.exports = {
  client,
};
