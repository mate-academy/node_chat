'use strict';

const { v4: uuidv4 } = require('uuid');

let rooms = [
  // {
  //   id: '1',
  //   name: `Room #1`,
  //   messages: [
  //     {
  //       time: new Date(),
  //       text: 'Ye',
  //       author: 'Max',
  //     },
  //   ],
  // },
];

const createMessage = message => {
  const messages = getAllMessages(message.room.id);

  messages.push({
    time: new Date(),
    text: message.message,
    author: message.name,
  });
};

const getAllMessages = id => rooms.find(room => room.id === id).messages;

const getAllRooms = () => rooms;

const createRoom = () => {
  const id = uuidv4();

  const newRoom = {
    id,
    name: `Room #${id}`,
    messages: [],
  };

  rooms.push(newRoom);

  return newRoom;
};

const deleteRoom = id => {
  rooms = rooms.filter(room => room.id !== id);
};

const updateRoom = (id, name) => {
  const roomIndex = rooms.findIndex(currentRoom => currentRoom.id === id);
  const oldRoom = rooms[roomIndex];

  oldRoom.name = name;
  rooms.splice(roomIndex, 1, oldRoom);
};

module.exports = {
  getAllMessages,
  createMessage,
  getAllRooms,
  createRoom,
  deleteRoom,
  updateRoom,
};
