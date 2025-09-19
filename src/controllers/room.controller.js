import { messageService } from '../services/message.service.js';
import { roomService } from '../services/room.service.js';
import { Message } from '../data/message.js';
import { userService } from '../services/user.service.js';

const getRoomInfoByRoomId = async (req, res) => {
  const { roomId } = req.params;

  const id = parseInt(roomId, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid roomId' });
  }

  const room = await roomService.findRoomById(id);

  if (!room) {
    return res.status(404).json({ message: 'Room not Found' });
  }

  const messages = await messageService.findRoomsMessages(id);

  return res.status(200).json({
    room: {
      id: room.id,
      name: room.name,
    },
    messages,
  });
};

const createRoom = async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  if (!name) {
    return res.status(400).json({ message: 'Room name is required' });
  }

  const newRoom = await roomService.createRoom(name);

  if (!newRoom) {
    return res.status(400).json({ message: 'Cannot create the room' });
  }

  await newRoom.addUser(user);

  const roomUsers = await newRoom.getUsers();
  const roomInfo = {
    room: { id: newRoom.id, name: newRoom.name },
    members: roomUsers,
  };

  return res.status(201).json(roomInfo);
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.findRoomById(roomId);

  if (!roomId || !room) {
    return res.status(404).json({ message: 'Room not Found' });
  }

  await room.setUsers([]);
  await Message.destroy({ where: { roomId: room.id } });
  await room.destroy();

  res.status(200).json({ message: 'Room deleted successfully' });
};

const renameRoom = async (req, res) => {
  const room = req.room;
  const { newName } = req.body;

  if (!room) {
    return res.status(404).json({ message: 'Room not Found' });
  }

  if (!newName || typeof newName !== 'string' || !newName.trim()) {
    return res.status(400).json({ message: 'Invalid room name provided' });
  }

  room.name = newName.trim();
  await room.save();

  return res.status(200).json(room);
};

const mergeRooms = async (req, res) => {
  const currentRoom = req.room;
  const user = req.user;
  const { targetRoomId } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!currentRoom) {
    return res.status(404).json({ error: 'Current room not found' });
  }

  if (!targetRoomId) {
    return res.status(400).json({ error: 'No targetRoomId provided' });
  }

  const targetRoomIdNum = parseInt(targetRoomId, 10);

  if (Number.isNaN(targetRoomIdNum)) {
    return res.status(400).json({ error: 'Invalid targetRoomId' });
  }

  const usersRooms = await roomService.findRoomsByUserId(user.id);
  const targetRoom = usersRooms.find((r) => r.id === targetRoomIdNum);

  if (!targetRoom) {
    return res
      .status(403)
      .json({ error: 'The user doesn’t have access to the target room' });
  }

  await userService.mergeUsers(currentRoom.id, targetRoomIdNum);
  await messageService.mergeMessages(currentRoom.id, targetRoomIdNum);

  await currentRoom.setUsers([]);
  await currentRoom.destroy();

  return res.status(200).json(targetRoom);
};

const joinRoom = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  const room = await roomService.findRoomById(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  await roomService.addUserToRoom(userId, roomId);

  return res.status(200).json({ message: 'Joined room successfully' });
};

export const roomController = {
  getRoomInfoByRoomId,
  createRoom,
  deleteRoom,
  renameRoom,
  mergeRooms,
  joinRoom,
};
