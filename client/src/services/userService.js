import { client } from '../http/client.js';

function login({ nickname }) {
  return client.post('/login', { nickname });
}

function getAllChats() {
  return client.get('/getAllChats');
}

function newMessage(newMessage, roomId) {
  return client.patch('/newMessage', { newMessage, roomId });
}

function createNewChat(newChatName, currentUser) {
  return client.put('/createNewChat', { newChatName, currentUser });
}

function joinRoom(roomId) {
  return client.post(`/room/${roomId}`);
}

function renameRoom(renameValue, roomId) {
  return client.patch('/room-rename', { renameValue, roomId });
}

function deleteRoom(roomId) {
  return client.delete(`/room-delete/${roomId}`);
}

export const userService = {
  login,
  newMessage,
  getAllChats,
  createNewChat,
  joinRoom,
  renameRoom,
  deleteRoom,
};
