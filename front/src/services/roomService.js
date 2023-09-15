import { httpClient } from "../http/httpClient.js";

function createRoom(name) {
  return httpClient.post(`${process.env.REACT_APP_API_URL}/rooms`, {
    name,
  });
}

function renameRoom(roomId, name) {
  return httpClient.patch(`${process.env.REACT_APP_API_URL}/rooms/rename`, {
    id: roomId,
    name,
  });
}

function deleteRoom(roomId) {
  return httpClient.delete(`${process.env.REACT_APP_API_URL}/rooms/${roomId}`);
}

function mergeRooms(absorbedId, absorbingId) {
  return httpClient.post(`${process.env.REACT_APP_API_URL}/rooms/merge`, {
    absorbedId,
    absorbingId,
  });
}

function getRoomById(id) {
  return httpClient.get(`${process.env.REACT_APP_API_URL}/rooms/${id}`);
}

function getAll() {
  return httpClient.get(`${process.env.REACT_APP_API_URL}/rooms`);
}

export const roomService = {
  createRoom,
  renameRoom,
  deleteRoom,
  mergeRooms,
  getRoomById,
  getAll,
};
