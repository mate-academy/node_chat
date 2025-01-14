/* eslint-disable no-debugger */
/* eslint-disable no-console */
const { Op } = require('sequelize');
const Chat = require('../models/Chat');
const ChatOfUser = require('../models/ChatOfUser');
const User = require('../models/User');

exports.createChat = async (req, res) => {
  const { name, userIds } = req.body;
  const userId = req.userId;

  if (!name?.length) {
    return res.status(400).json({ error: 'Будь ласка, введіть назву чату' });
  }

  if (!userIds?.length) {
    return res
      .status(400)
      .json({ error: 'Будь ласка, оберіть учасника(-ків) чату' });
  }

  const filteredUserIds = userIds.filter((id) => id !== userId);
  const uniqueUserIds = [...new Set(filteredUserIds)];

  await Promise.all(
    uniqueUserIds.map(async (currentId) => {
      const currentUserIdIsValid = await User.findOne({
        where: { id: currentId },
      });

      if (!currentUserIdIsValid) {
        throw new Error(`Користувач з id ${currentId} не існує`);
      }
    }),
  ).catch((error) => {
    return res.status(404).json({ error: error.message });
  });

  const chatExist = await ChatOfUser.findOne({
    where: { UserId: userId },
    include: [
      {
        model: Chat,
        where: { name },
        attributes: ['id', 'name'],
      },
    ],
  });

  if (chatExist) {
    return res.status(400).json({ error: 'Такий чат Ви вже створили' });
  }

  try {
    const chat = await Chat.create({ name });

    await ChatOfUser.create({ ChatId: chat.id, UserId: userId });

    const chatUsers = uniqueUserIds.map((id) => ({
      ChatId: chat.id,
      UserId: id,
    }));

    await ChatOfUser.bulkCreate(chatUsers);

    const { sendWSMessageToUsers } = require('./wsController');

    await sendWSMessageToUsers(uniqueUserIds, 'new_chat', chat);

    return res.status(201).json(chat);
  } catch (error) {
    console.error('Помилка:', error);

    return res.status(400).json({ error: 'Помилка при створенні чату' });
  }
};

const normalizedUser = ({
  id,
  name,
  email,
  password,
  createdAt,
  updatedAt,
}) => {
  return { id, name };
};

exports.returnAllUsers = async (req, res) => {
  const userId = req.userId;

  try {
    const users = await User.findAll({ where: { id: { [Op.ne]: userId } } });
    const normalizedUserList = users.map((user) => normalizedUser(user));

    return res.status(201).json(normalizedUserList);
  } catch (error) {
    console.error(error);

    return res.status(404).json({ error: 'Помилка при виборі юзерів' });
  }
};
