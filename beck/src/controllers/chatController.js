/* eslint-disable no-console */
/* eslint-disable max-len */
const Chat = require('../models/Chat');
const ChatOfUser = require('../models/ChatOfUser');
const Message = require('../models/Message');

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
    console.log(error);

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
    console.log(error);

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

  try {
    await ChatOfUser.destroy({ where: { ChatId: chatId } });

    await Message.destroy({ where: { ChatId: chatId } });

    await Chat.destroy({ where: { id: chatId } });

    return res.status(200).json({ message: 'Чат видалено' });
  } catch (error) {
    console.log(error);

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

  try {
    chatExist.name = newName.trim();

    await chatExist.save();

    return res.status(200).json({ message: 'Чат успішно перейменовано' });
  } catch (error) {
    console.error(error);

    return res.status(400).json({ error: 'Помилка при перейменуванні чату' });
  }
};
