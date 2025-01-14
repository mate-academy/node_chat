/* eslint-disable no-console */
/* eslint-disable max-len */
const Chat = require('../models/Chat');
const ChatOfUser = require('../models/ChatOfUser');
const Message = require('../models/Message');
const { Op } = require('sequelize');

exports.getChats = async (req, res) => {
  const userId = req.userId;

  try {
    const userChats = await ChatOfUser.findAll({
      where: { UserId: userId },
      include: [{ model: Chat, attributes: ['id', 'name'] }],
    });

    const chats = userChats.map((userChat) => ({
      id: userChat.Chat.id,
      name: userChat.Chat.name,
    }));

    return res.status(200).json(chats);
  } catch (error) {
    return res.status(400).json({ error: 'Помилка при отриманні чатів' });
  }
};

exports.exitFromChat = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.userId;

  if (!chatId) {
    return res.status(404).json({ error: 'Не обраний чат для виходу' });
  }

  const chatExist = await Chat.findByPk(chatId);

  if (!chatExist) {
    return res.status(404).json({ error: `Чату з ID=${chatId} не існує` });
  }

  try {
    const chatToDeleteForMe = await ChatOfUser.findOne({
      where: { UserId: userId, ChatId: chatId },
    });

    if (!chatToDeleteForMe) {
      return res.status(400).json({ error: 'Ви не є учисником цього чату' });
    }

    await chatToDeleteForMe.destroy();

    return res.status(200).json({ message: 'Вихід з чату успішний' });
  } catch (error) {
    return res.status(400).json({ error: 'Помилка виходу' });
  }
};

exports.deleteChat = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.userId;

  if (!chatId) {
    return res.status(404).json({ error: 'Не обраний чат для видалення' });
  }

  const chatExist = await Chat.findByPk(chatId);

  if (!chatExist) {
    return res.status(404).json({ error: `Чату з ID=${chatId} не існує` });
  }

  const iAmInChat = await ChatOfUser.findOne({
    where: { ChatId: chatId, UserId: userId },
  });

  if (!iAmInChat) {
    return res.status(404).json({ error: 'Ви не є часником чату' });
  }

  const userIds = await ChatOfUser.findAll({
    where: { ChatId: chatId },
    attributes: ['UserId'],
    raw: true,
  });

  const userIdArray = userIds
    .map((record) => record.UserId)
    .filter((id) => id !== userId);

  try {
    await ChatOfUser.destroy({ where: { ChatId: chatId } });

    await Message.destroy({ where: { ChatId: chatId } });

    await Chat.destroy({ where: { id: chatId } });

    const { sendWSMessageToUsers } = require('./wsController');

    await sendWSMessageToUsers(userIdArray, 'chat_deleted', chatId);

    return res.status(200).json({ message: 'Чат видалено' });
  } catch (error) {
    return res.status(400).json({ error: 'Помилка видалення чату' });
  }
};

exports.renameChat = async (req, res) => {
  const { newName, chatId } = req.body;
  const userId = req.userId;

  if (!chatId) {
    return res.status(404).json({ error: 'Не обраний чат' });
  }

  const chatExist = await Chat.findByPk(chatId);

  if (!chatExist) {
    return res.status(404).json({ error: `Чату з ID=${chatId} не існує` });
  }

  if (!newName?.trim().length) {
    return res.status(404).json({ error: `Введіть нову назву чату` });
  }

  const iAmInChat = await ChatOfUser.findOne({
    where: { ChatId: chatId, UserId: userId },
  });

  if (!iAmInChat) {
    return res.status(404).json({ error: 'Ви не є учасником чату' });
  }

  const userIds = await ChatOfUser.findAll({
    where: { ChatId: chatId },
    attributes: ['UserId'],
    raw: true,
  });

  const userIdArray = userIds
    .map((record) => record.UserId)
    .filter((id) => id !== userId);

  try {
    chatExist.name = newName.trim();

    await chatExist.save();

    const { sendWSMessageToUsers } = require('./wsController');

    await sendWSMessageToUsers(userIdArray, 'chat_renamed', chatExist);

    return res.status(200).json(chatExist);
  } catch (error) {
    console.error(error);

    return res.status(400).json({ error: 'Помилка при перейменуванні чату' });
  }
};

exports.addUsers = async (req, res) => {
  const { chatId } = req.params;
  const { userIds } = req.body;
  const userId = req.userId;

  if (!chatId) {
    return res.status(404).json({ error: 'Не обраний чат' });
  }

  const chatExist = await Chat.findByPk(chatId);

  if (!chatExist) {
    return res.status(404).json({ error: `Чату з ID=${chatId} не існує` });
  }

  if (!userIds) {
    return res.status(404).json({ error: 'не обрані учасники' });
  }

  const usersOfChat = await ChatOfUser.findAll({
    where: {
      ChatId: chatId,
      UserId: { [Op.ne]: userId },
    },
    attributes: ['UserId'],
    raw: true,
  });

  const listOfUsersOfChat = usersOfChat.map((user) => user.UserId);

  try {
    const newUsers = [];
    const deletedUsers = [];

    await Promise.all(
      userIds.map(async (id) => {
        const iAmInChat = await ChatOfUser.findOne({
          where: { ChatId: chatId, UserId: id },
        });

        if (!iAmInChat) {
          await ChatOfUser.create({ ChatId: chatId, UserId: id });
          newUsers.push(id);
        }
      }),
    );

    await Promise.all(
      listOfUsersOfChat.map(async (prevId) => {
        if (!userIds.includes(prevId)) {
          await ChatOfUser.destroy({
            where: { ChatId: chatId, UserId: prevId },
          });

          deletedUsers.push(prevId);
        }
      }),
    );

    const { sendWSMessageToUsers } = require('./wsController');

    await sendWSMessageToUsers(newUsers, 'new_chat', chatExist);

    await sendWSMessageToUsers(deletedUsers, 'chat_deleted', chatExist.id);

    return res.status(200).json(chatExist);
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Помилка при додаванні користувачів' });
  }
};

exports.getUsersOfChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userId;

  if (!chatId) {
    return res.status(404).json({ error: 'Не обраний чат' });
  }

  const chatExist = await Chat.findByPk(chatId);

  if (!chatExist) {
    return res.status(404).json({ error: `Чату з ID=${chatId} не існує` });
  }

  try {
    const userIds = await ChatOfUser.findAll({
      where: {
        ChatId: chatId,
        UserId: { [Op.ne]: userId },
      },
      attributes: ['UserId'],
      raw: true,
    });

    const listOfUserIds = userIds.map((user) => user.UserId);

    return res.status(200).json(listOfUserIds);
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Помилка при додаванні користувачів' });
  }
};
