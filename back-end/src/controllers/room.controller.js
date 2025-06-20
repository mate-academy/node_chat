import { ApiError } from '../exeptions/api.error.js';
import { roomService } from '../services/rooms.service.js';
import { userService } from '../services/user.service.js';

const getAll = async (req, res) => {
  const rooms = await roomService.getAll();

  res.send(rooms);
};

const create = async (req, res) => {
  const { roomName } = req.body;

  console.log('Room name: ', roomName);

  const newRoom = await roomService.create(roomName);

  res.send(newRoom);
};

const rename = async (req, res) => {
  const { id } = req.params;
  const { newRoomName } = req.body;

  console.log('roomId: ', id);
  console.log('newRoomName: ', newRoomName);

  const updatedRoom = await roomService.rename(id, newRoomName);

  res.send(updatedRoom);
};

const join = async (req, res) => {
  const { roomId } = req.params;
  const activeUser = req.cookies.activeUser;
  const user = await userService.getUser(activeUser.name);

  try {
    await roomService.join(roomId, user);
    res
      .status(200)
      .json({ message: `User joined room ${roomId} successfully.` });
  } catch (error) {
    console.error('Error joining room:', error);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  await roomService.remove(id);

  res.status(201).send();
};

const getJoined = async (req, res) => {
  const { id } = req.params;

  // if (id instanceof undefined) {
  //   throw ApiError.badRequest('Id is undefined');
  // }

  const roomIds = (await roomService.getJoined(id)) || [];

  res.send(roomIds);
};

export const roomController = {
  getAll,
  create,
  rename,
  join,
  remove,
  getJoined,
};
