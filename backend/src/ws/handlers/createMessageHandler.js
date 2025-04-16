const messagesRepository = require('../../entity/message.repository');
const usersRepository = require('../../entity/users.repository');
const { WsError } = require('../../exceptions/ws.error');
const { broadcastMessage } = require('../../utils/broadcastMesssage');

async function createMessageHandler(wss, data) {
  if (!data.text) {
    throw WsError.validationError('Text is required', {
      text: 'Text is required',
    });
  }

  const user = await usersRepository.getById(data.userId);

  if (!user) {
    throw WsError.notFound({
      userId: 'User not found',
    });
  }

  const newMessage = await messagesRepository.create(data);

  broadcastMessage(wss, newMessage);
}

module.exports = createMessageHandler;
