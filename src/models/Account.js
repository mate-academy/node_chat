const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const Account = client.define('account', {
  nickname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { Account };
