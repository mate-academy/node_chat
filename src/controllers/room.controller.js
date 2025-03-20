import { roomService } from '../services/room.service.js';
import { messageService } from '../services/message.service.js';

const getAllRooms = async (req, res) => {
  const allRooms = await roomService.getAllRooms();

  return res.send(allRooms);
};

const createNewRoom = async (req, res) => {
  const { roomName } = req.body;

  const result = await roomService.createNewRoom(roomName);

  return res.status(201).send(roomService.normalizeRoom(result));
};

const getAllMessages = async (req, res) => {
  const { roomId } = req.params;

  const messages = await roomService.getAllRoomMessages(+roomId);

  return res.send(messages);
};

const createNewMessage = async (req, res) => {
  const { message, authorId } = req.body;
  const { roomId } = req.params;

  const newMessage = await messageService.createNewMessage(
    message,
    roomId,
    authorId,
  );

  return res
    .status(201)
    .send(messageService.normalizeMessage(newMessage.toJSON()));
};

const changeRoomName = async (req, res) => {
  const { roomId } = req.params;
  const { newRoomName } = req.body;

  const result = await roomService.changeRoomName(roomId, newRoomName);

  return res.status(200).send(result);
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  await roomService.deleteRoom(+roomId);

  return res.sendStatus(204);
};

const getRoomInfo = async (req, res) => {
  const { roomId } = req.params;

  const targetRoom = await roomService.findRoomById(+roomId);

  return res.status(200).send({
    roomName: targetRoom.roomName,
    roomId: targetRoom.id,
  });
};

export const roomController = {
  getAllRooms,
  createNewRoom,
  getAllMessages,
  createNewMessage,
  changeRoomName,
  deleteRoom,
  getRoomInfo,
};
