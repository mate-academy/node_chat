/* eslint-disable max-len */
/* eslint-disable no-console */
// const { Op } = require('sequelize');
const Chat = require('../models/Chat');
const ChatOfUser = require('../models/ChatOfUser');
const Message = require('../models/Message');
const User = require('../models/User');

const normalizedMessage = ({ id, text, UserId, ChatId }) => {
  return {
    id,
    text,
    UserId,
    ChatId,
  };
};

exports.createMessage = async (req, res) => {
  const { text, chatId } = req.body;
  const userId = req.userId;

  const chatExist = await Chat.findOne({ where: { id: chatId } });

  if (!chatExist) {
    return res.status(404).json({ error: 'Такого чату не існує' });
  }

  const iAmInChat = await ChatOfUser.findOne({
    where: { ChatId: chatId, UserId: userId },
  });

  if (!iAmInChat) {
    return res.status(404).json({ error: 'Ви не є учасником чату' });
  }

  if (!text?.trim().length) {
    return res.status(400).json({ error: 'Будь ласка, введіть повідомлення' });
  }

  const author = await User.findByPk(userId);

  try {
    const message = await Message.create({
      text: text.trim(),
      UserId: userId,
      ChatId: chatId,
    });

    const messageWithAuthor = {
      message: normalizedMessage(message),
      author: author.name,
    };

    const { sendByWS } = require('./wsController');

    await sendByWS(chatId, userId, 'new_message', messageWithAuthor);

    res.status(201).json(messageWithAuthor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Помилка при надсиланні повідомлення' });
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userId;

  const chatExist = await Chat.findOne({ where: { id: chatId } });

  if (!chatExist) {
    return res.status(404).json({ error: 'Оберіть чат' });
  }

  const iAmInChat = await ChatOfUser.findOne({
    where: { ChatId: chatId, UserId: userId },
  });

  if (!iAmInChat) {
    return res.status(404).json({ error: 'Ви не є учасником чату' });
  }

  try {
    const messages = await Message.findAll({
      where: { ChatId: chatId },
      include: [{ model: User, attributes: ['name'] }], // Отримуємо автора
    });

    const normalizedMessages = messages.map((message) => ({
      message: normalizedMessage(message),
      author: message.User.name,
    }));

    res.status(200).json(normalizedMessages);
  } catch (error) {
    console.error('Помилка при отриманні повідомлень:', error);
    res.status(400).json({ error: 'Помилка при отриманні повідомлень' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { chatId } = req.query;
  const userId = req.userId;

  try {
    const message = await Message.findOne({
      where: { id: messageId, UserId: userId, ChatId: chatId },
    });

    if (!message) {
      return res.status(404).json({
        error: 'Повідомлення не знайдено або ви не маєте прав його видалити',
      });
    }

    await message.destroy();
    res.status(200).json({ message: 'Повідомлення видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при видаленні повідомлення' });
  }
};

exports.updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { newText } = req.body;
  const userId = req.userId;

  if (!newText?.trim()) {
    return res
      .status(400)
      .json({ error: 'Повідомлення не може бути порожнім' });
  }

  const findChatId = await Message.findOne({
    where: { id: messageId, UserId: userId },
    attributes: ['ChatId'],
    raw: true,
  });

  try {
    const message = await Message.findOne({
      where: { id: messageId, UserId: userId },
    });

    if (!message) {
      return res.status(404).json({
        error: 'Повідомлення не знайдено або ви не маєте прав його редагувати',
      });
    }

    message.text = newText.trim();
    await message.save();

    const { sendByWS } = require('./wsController');

    await sendByWS(findChatId.ChatId, userId, 'updated_message', message);

    res.status(200).json({ updatedMessage: normalizedMessage(message) });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при оновленні повідомлення' });
  }
};
