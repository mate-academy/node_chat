import axios from 'axios';

const BASE_API = 'http://localhost:3005/rooms';

const getRooms = async () => {
  const response = (await axios.get(BASE_API)).data;

  return response;
};

const createRoom = async (roomName: string) => {
  const newRoom = (await axios.post(BASE_API, { roomName })).data;

  return newRoom;
};

const updateRoom = async (id: number, roomName: string) => {
  await axios.patch(`${BASE_API}/${id}`, { roomName });
};

const deleteRoom = async (id: number) => {
  await axios.delete(`${BASE_API}/${id}`);
};

export const roomsApi = {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
