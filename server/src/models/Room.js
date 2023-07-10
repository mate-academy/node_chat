'use strict';

const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const Room = sequelize.define('Message', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'rooms',
});

module.exports = { Room };
