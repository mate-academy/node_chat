import { ApiError } from '../utils/ApiError';
import { rooms } from './roomService.js';

export const sendMessageService = (roomName, author, text) => {
  if (!roomName || !author || !text) {
    throw ApiError.BadRequest('All fields are required');
  }

  if (!rooms[roomName]) {
    throw ApiError.NotFound();
  }

  const message = { author, text, time: new Date().toISOString() };

  rooms[roomName].push(message);

  return { message: 'Succes send message' };
};

// export const messageServices = {
//   sendMessageService,
// }
