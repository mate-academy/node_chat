import { httpClient } from "../http/httpClient.js";

function createMessage({ authorFullName, text }) {
  return httpClient.post(`${process.env.REACT_APP_API_URL}/messages`, {
    authorFullName,
    text,
  });
}

function getById(id) {
  return httpClient.get(`${process.env.REACT_APP_API_URL}/users/${id}`);
}

function getAllForRoom(roomId) {
  return httpClient.get(`${process.env.REACT_APP_API_URL}/messages/${roomId}`);
}

function getAll() {}

export const messageService = {
  createMessage,
  getById,
  getAllForRoom,
  getAll,
};
