const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db.js');
const Chat = require('./chat.js');
const Message = require('./message.js');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 30],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 30],
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 500],
    },
  },
});

User.belongsToMany(Chat, { through: 'user_chat' });
Chat.belongsToMany(User, { through: 'user_chat' });

User.hasMany(Message);
Message.belongsTo(User);

module.exports = User;
