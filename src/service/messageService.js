import { ApiError } from '../utils/ApiError.js';
import { roomService } from './roomService.js';

const sendMessageService = (roomName, author, text) => {
  console.log(roomName);
  console.log(roomService.rooms);

  if (!roomName || !author || !text) {
    throw ApiError.BadRequest('All fields are required');
  }

  if (!roomService.rooms[roomName]) {
    throw ApiError.NotFound();
  }

  const message = { author, text, time: new Date().toISOString() };

  roomService.rooms[roomName].push(message);

  return { message: 'Success send message' };
};

export const messageServices = {
  sendMessageService,
}
