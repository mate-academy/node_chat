import { ApiError } from '../exceptions/api.error.js';
import { messageService } from '../services/message.service.js';

const getAllMessagesByRoomID = async (roomId) => {
  if (isNaN(+roomId)) {
    throw ApiError.BadRequest('Invalid room ID');
  }

  const messages = await messageService.findMessagesByRoomId(roomId);

  const normalizedMessages = await Promise.all(
    messages.map(async (message) => {
      const user = await messageService.findUserById(message.userId);

      return {
        message: 'Ok',
        data: normalizeMessage({
          id: message.id,
          userName: user ? user.username : 'anonymous',
          text: message.text,
          time: message.time,
        }),
      };
    }),
  );

  return normalizedMessages;
};

const deleteMessagesByRoomId = async (roomId) => {
  if (isNaN(+roomId)) {
    throw ApiError.BadRequest('Invalid room ID');
  }

  await messageService.deleteMessagesByRoomId(roomId);

  return {
    message: 'Message deleted successfully',
  };
};

const createMessageByRoomId = async (roomId, userName, text) => {
  if (!userName || !text.trim()) {
    throw ApiError.BadRequest('All fields required');
  }

  if (isNaN(+roomId)) {
    throw ApiError.BadRequest('Invalid room ID');
  }

  const user = await messageService.findOrCreateUserByName(userName);
  const newMessage = await messageService.createMessage(roomId, user.id, text);

  return {
    message: 'Message created successfully',
    data: normalizeMessage({
      id: newMessage.id,
      userName: user.username,
      text: newMessage.text,
      time: newMessage.time,
    }),
  };
};

function normalizeMessage({ id, userName, text, time }) {
  const dateString = time.toString();
  const trimmedDate = dateString.split(':').slice(0, 2).join(':');

  return {
    id,
    userName,
    text,
    time: trimmedDate,
  };
}

export const messageController = {
  getAllMessagesByRoomID,
  createMessageByRoomId,
  deleteMessagesByRoomId,
};
