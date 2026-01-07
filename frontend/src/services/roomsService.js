import { httpClient } from '../http/httpClient';

const getAll = () => {
  return httpClient.get('/rooms');
};

const createRoom = (roomName, authorName) => {
  return httpClient.post('/rooms', { roomName, authorName });
};

const renameRoom = (roomId, roomName, authorName) => {
  return httpClient.patch(`/rooms/${roomId}`, {
    roomName,
    authorName,
  });
};

const deleteRoom = (roomId, authorName) => {
  return httpClient.delete(`/rooms/${roomId}`, { data: { authorName } });
};

export const roomsService = {
  getAll,
  createRoom,
  renameRoom,
  deleteRoom,
};
