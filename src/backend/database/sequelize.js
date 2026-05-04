'use strict';

const { Sequelize } = require('sequelize');
const { databaseUrl, shouldUseSsl } = require('../config/env');

const dialectOptions = {};

if (shouldUseSsl) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,
  },
  dialectOptions,
});

module.exports = sequelize;
