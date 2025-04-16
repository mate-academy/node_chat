const { client } = require('../utils/db');
const { DataTypes } = require('sequelize');
const User = require('./User.model');

const Message = client.define('message', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true, notNull: true },
  },
});

Message.belongsTo(User, {
  foreignKey: {
    name: 'authorId',
    allowNull: false,
    validate: { notEmpty: true, notNull: true },
  },
});
User.hasMany(Message, { foreignKey: 'authorId', onDelete: 'CASCADE' });

module.exports = Message;
