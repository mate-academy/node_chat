import { uuid as v4 } from 'uuidv4';
import { userService } from './auth.service.js';

let rooms = [];

const getAllRooms = () => {
  return rooms;
};

const createNewRoom = ({ name }, user) => {
  const isRoomAlreadyExists = rooms.find((room) => room.name === name);

  if (isRoomAlreadyExists) {
    return;
  }

  const author = userService.findAuthor(user);

  if (!author) {
    return;
  }

  const newRoom = {
    name,
    members: [author],
    admin: author,
    messages: [],
    id: v4(),
  };

  rooms.push(newRoom);

  return newRoom;
};

const getRoomById = (id) => {
  return rooms.find((room) => room.id === id);
};

const isUserAdmin = (user, roomId) => {
  const room = getRoomById(roomId);

  if (!room) {
    return false;
  }

  if (room.admin.name === user) {
    return true;
  }

  return false;
};

const deleteRoom = (id) => {
  rooms = rooms.filter((room) => {
    return room.id !== id;
  });
};

const leaveRoom = (roomId, user) => {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  const newMembers = room.members.filter((member) => member.name !== user);

  room.members = newMembers;
};

const joinRoom = (id, user) => {
  const room = getRoomById(id);

  if (!room) {
    return;
  }

  room.members.push(user);
};

const renameRoom = (id, newName) => {
  const room = getRoomById(id);

  if (!room) {
    return;
  }

  room.name = newName;
};

export const roomsService = {
  getAllRooms,
  createNewRoom,
  deleteRoom,
  joinRoom,
  getRoomById,
  leaveRoom,
  isUserAdmin,
  renameRoom,
};
