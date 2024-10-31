import { userServices } from './../services/userService.js';
import { v4 as uuidv4 } from 'uuid';

let user = '';

const defaultChatId = uuidv4();

const rooms = [
  {
    id: defaultChatId,
    creator: '',
    name: 'Main-room',
    history: [],
  },
];

function messageValidation(message) {
  if (!message || message.trim().length === 0) {
    return 'Message required';
  }

  if (message.trim().length > 3000) {
    return 'Message is too long';
  }

  return null;
}

function chatNameValidation(newChatName) {
  if (!newChatName || newChatName.trim().length === 0) {
    return 'Chat name required';
  }

  if (newChatName.trim().length < 2) {
    return 'Chat name is too short';
  }

  if (newChatName.length > 30) {
    return 'Less then 30 characters required';
  }

  return null;
}

const login = (req, res) => {
  user = req.body.nickname;

  res.sendStatus(200);
};

const setNewMessage = (req, res) => {
  const { newMessage, roomId } = req.body;

  const messageValidationError = messageValidation(newMessage);

  if (messageValidationError) {
    return res.status(400).json({ error: messageValidationError });
  }

  const currentRoom = rooms.find((room) => room.id === roomId);

  if (!currentRoom) {
    return res.status(404).json('room not found');
  }

  const newMessageObj = userServices.newMessageService(newMessage, user);

  currentRoom.history.push(newMessageObj);

  res.status(201).json(currentRoom);
};

const getAllChats = (req, res) => {
  res.status(200).json(rooms);
};

const createNewChat = (req, res) => {
  const { newChatName, currentUser } = req.body;

  const id = uuidv4();

  const newChat = {
    id: id,
    creator: currentUser,
    name: newChatName,
    history: [],
  };

  rooms.push(newChat);

  res.status(201).json(rooms);
};

const joinRoom = (req, res) => {
  const { roomId } = req.params;

  const currentRoom = rooms.find((room) => room.id === roomId);

  if (!currentRoom) {
    return res.status(404).json('room not found');
  }

  res.status(200).json(currentRoom);
};

const roomRename = (req, res) => {
  const { renameValue, roomId } = req.body;

  const neededRoom = rooms.find((room) => room.id === roomId);

  if (!neededRoom) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (neededRoom.creator !== user) {
    return res.status(403).json({ error: 'Only creator can rename a chat!' });
  }

  const nameValidationError = chatNameValidation(renameValue);

  if (nameValidationError) {
    return res.status(400).json({ error: nameValidationError });
  }

  const neededRoomIndex = rooms.findIndex((room) => room.id === roomId);

  rooms[neededRoomIndex].name = renameValue;

  res.status(201).json(rooms);
};

const deleteRoom = (req, res) => {
  const { roomId } = req.params;

  const neededRoom = rooms.find((room) => room.id === roomId);

  if (!neededRoom) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (neededRoom.creator !== user) {
    return res.status(403).json({ error: 'Only creator can delete a chat!' });
  }

  const roomIndex = rooms.findIndex((room) => room.id === roomId);

  rooms.splice(roomIndex, 1);

  res.status(201).json(rooms);
};

export const userController = {
  login,
  setNewMessage,
  getAllChats,
  createNewChat,
  joinRoom,
  roomRename,
  deleteRoom,
};
