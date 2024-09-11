'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db.js');

const Room = sequelize.define('room', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = {
  Room,
};
