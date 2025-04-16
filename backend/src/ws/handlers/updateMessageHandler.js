const messagesRepository = require('../../entity/message.repository');
const { WsError } = require('../../exceptions/ws.error');
const { broadcastMessage } = require('../../utils/broadcastMesssage');

async function updateMessageHandler(wss, data) {
  if (!data.text) {
    throw WsError.validationError('Text is required', {
      text: 'Text is required',
    });
  }

  if (!data.id) {
    throw WsError.validationError('Message ID is required', {
      id: 'Message ID is required',
    });
  }

  const messageToUpdate = await messagesRepository.getById(data.id);

  if (!messageToUpdate) {
    throw WsError.notFound({
      messageId: 'Message not found',
    });
  }

  if (messageToUpdate.authorId !== data.user.id) {
    throw WsError.forbidden({
      update: 'You are not the author of this message',
    });
  }

  const updatedMessage = await messagesRepository.updateById(data.id, {
    text: data.text,
  });

  broadcastMessage(wss, {
    event: 'message/update',
    message: updatedMessage,
  });
}

module.exports = updateMessageHandler;
