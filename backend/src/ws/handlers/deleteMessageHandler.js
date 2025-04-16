const messagesRepository = require('../../entity/message.repository');
const { WsError } = require('../../exceptions/ws.error');
const { broadcastMessage } = require('../../utils/broadcastMesssage');

async function deleteMessageHandler(wss, data) {
  if (!data.id) {
    throw WsError.validationError('Message ID is required', {
      id: 'Message ID is required',
    });
  }

  const messageToDelete = await messagesRepository.getById(data.id);

  if (!messageToDelete) {
    throw WsError.notFound({
      messageId: 'Message not found',
    });
  }

  if (data.user.name !== 'admin' && messageToDelete.authorId !== data.user.id) {
    throw WsError.forbidden({
      delete: 'You are not the author of this message',
    });
  }

  await messagesRepository.deleteById(data.id);

  broadcastMessage(wss, {
    event: 'message/delete',
    id: data.id,
  });
}

module.exports = deleteMessageHandler;
