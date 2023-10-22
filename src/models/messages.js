'use strict';

const { client } = require('../utils/db');
const { DataTypes } = require('sequelize');

const Messages = client.define('message', {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = {
  Messages,
};
