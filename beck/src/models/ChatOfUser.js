const { sequelize } = require('./index.js');
const Chat = require('./Chat');
const User = require('./User');

const ChatOfUser = sequelize.define(
  'ChatOfUser',
  {},
  {
    tableName: 'chat_users_',
  },
);

Chat.belongsToMany(User, { through: ChatOfUser });
User.belongsToMany(Chat, { through: ChatOfUser });
ChatOfUser.belongsTo(Chat, { foreignKey: 'ChatId' });
ChatOfUser.belongsTo(User, { foreignKey: 'UserId' });

module.exports = ChatOfUser;
