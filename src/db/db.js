'use strict';

const { Sequelize } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.ELEPHANT_SQL_URL);

module.exports = {
  sequelize,
};
