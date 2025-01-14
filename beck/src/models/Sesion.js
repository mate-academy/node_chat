const { DataTypes } = require('sequelize');
const { sequelize } = require('./index.js');

const Session = sequelize.define(
  'Session',
  {
    userId: { type: DataTypes.DECIMAL },
    token: { type: DataTypes.STRING },
  },
  {
    tableName: 'sessions_',
  },
);

module.exports = Session;
