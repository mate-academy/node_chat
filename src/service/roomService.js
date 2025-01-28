import { ApiError } from '../utils/ApiError.js';

const rooms = {};

export const createRoomService = (roomName) => {
  if (!roomName) {
    throw ApiError.BadRequest('Room name is required.');
  }

  if (rooms[roomName]) {
    throw ApiError.BadRequest('Room already exists.');
  }

  rooms[roomName] = [];

  return { message: 'Room successfully created.' };
};

// Перейменування кімнати
export const renameRoomService = (currentRoomName, newRoomName) => {
  if (!currentRoomName || !newRoomName) {
    throw ApiError.BadRequest(
      'Both current room name and new room name are required.',
    );
  }

  if (!rooms[currentRoomName]) {
    throw ApiError.NotFound('Room not found.');
  }

  if (rooms[newRoomName]) {
    throw ApiError.BadRequest('A room with the new name already exists.');
  }

  rooms[newRoomName] = rooms[currentRoomName];
  delete rooms[currentRoomName];

  return { message: 'Room successfully renamed.' };
};

// Видалення кімнати
export const deleteRoomService = (roomName) => {
  if (!roomName) {
    throw ApiError.BadRequest('Room name is required.');
  }

  if (!rooms[roomName]) {
    throw ApiError.NotFound('Room not found.');
  }

  delete rooms[roomName];

  return { message: 'Room successfully deleted.' };
};

// Отримання повідомлень з кімнати
export const getRoomMessageService = (roomName) => {
  if (!rooms[roomName]) {
    throw ApiError.NotFound('Room not found.');
  }

  return { messages: rooms[roomName] };
};

// export const roomServices = {
//   createRoomService,
//   renameRoomService,
//   deleteRoomService,
//   getRoomMessageService,
// };
