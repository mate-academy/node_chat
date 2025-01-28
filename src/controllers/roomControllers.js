import {
  createRoomService,
  renameRoomService,
  deleteRoomService,
  getRoomMessageService,
} from '../service/roomService';

export const createRoom = (req, res, next) => {
  try {
    const { name: roomName } = req.body;
    const result = createRoomService(roomName);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const renameRoom = (req, res, next) => {
  try {
    const { name: currentName, newName } = req.body;
    const rename = renameRoomService(currentName, newName);

    res.send(rename.message);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = (req, res, next) => {
  try {
    const { name: roomName } = req.body;
    const result = deleteRoomService(roomName);

    res.send(result.message);
  } catch (error) {
    next(error);
  }
};

export const getRoomMessage = (req, res, next) => {
  try {
    const { name: roomName } = req.body;

    const result = getRoomMessageService(roomName);

    res.json(result.messages);
  } catch (error) {
    next(error);
  }
};

// export const roomControl = {
//   renameRoom,
//   createRoom,
//   deleteRoom,
//   getRoomMessage,
// }
