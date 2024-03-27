'use strict';

const { DataTypes } = require('sequelize');
const { db } = require('../utils/db.js');

const User = db.define('users', {
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
}, {
  updatedAt: false,
}) || {};

module.exports = { User };
