const ApiError = require('../exeptions/api.error');
const { Message, User, Room } = require('../module');
const { getAllMessagesByIdRoom, getMessageById } = require('../services/messages.services');

async function getChat(req, res) {
  const { idRoom } = req.params;

const chat = await getAllMessagesByIdRoom(idRoom);

  if (!chat) {
    throw ApiError.notFound('Chat not found, occurred error');
  }

  res.json(chat);
}

async function postMessage(req, res) {
  const { idRoom } = req.params;
  const {idUser, message} = req.body;

  const responce = await Message.create({ idRoom, message, idUser });

  const newMessage = await getMessageById(responce.id);

  res.json(newMessage.dataValues);
}


module.exports = {
  chatController: {
    getChat,
    postMessage
  }
}
