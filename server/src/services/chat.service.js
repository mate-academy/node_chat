// require('../db/associations.js');

const Chat = require('../models/chat.js');
const User = require('../models/user.js');
const ApiError = require('../exceptions/apiError.js');
const Message = require('../models/message.js');
const { sequelize } = require('../db/db.js');

Chat.hasMany(Message);
Message.belongsTo(Chat);

async function findChat(firstId, secondId) {
  const user1 = await User.findByPk(firstId);
  const user2 = await User.findByPk(secondId);

  if (!user1 || !user2) {
    return null;
  }

  const chat = await Chat.findOne({
    include: [
      {
        model: User,
        as: 'users',
        where: {
          id: [user1.id, user2.id],
        },
        through: { attributes: [] },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      },
    ],
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  });

  return chat;
}

const createChat = async (firstId, secondId) => {
  const chat = await Chat.create();

  const [user1, user2] = await Promise.all([
    User.findByPk(firstId),
    User.findByPk(secondId),
  ]);

  if (!user1 || !user2) {
    throw ApiError.BadRequest('One or both users not found');
  }

  await chat.addUsers([user1, user2]);

  return chat;
};

const getUserChats = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const chats = await user.getChats({
    include: [
      {
        model: User,
        as: 'users',
        through: { attributes: [] },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      },
      {
        model: Message,
        attributes: ['id', 'date', 'author', 'text', 'read'],
        required: false,
        limit: 1,
        order: [[sequelize.literal('date DESC')]],
        include: [
          {
            model: Chat,
            attributes: [],
          },
        ],
      },
    ],
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  });

  const formattedChats = chats.map((chat) => ({
    id: chat.id,
    unread: chat.unread,
    lastMessage: chat.messages[0],
    members: chat.users.map((member) => ({
      id: member.id,
      name: member.name,
    })),
  }));

  return formattedChats;
};

module.exports = getUserChats;

module.exports = {
  createChat,
  getUserChats,
  findChat,
};
