import express from 'express';
import { isAuth } from '../midlewares/isAuth.js';
import { isUserInRoom } from '../midlewares/isUserInRoom.js';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = express.Router();

roomRouter.get(
  '/:roomId',
  catchError(isAuth),
  catchError(isUserInRoom),
  catchError(roomController.getRoomInfoByRoomId),
);

roomRouter.post('/', catchError(isAuth), catchError(roomController.createRoom));

roomRouter.delete(
  '/:roomId',
  catchError(isAuth),
  catchError(isUserInRoom),
  catchError(roomController.deleteRoom),
);

roomRouter.patch(
  '/:roomId',
  catchError(isAuth),
  catchError(isUserInRoom),
  catchError(roomController.renameRoom),
);

roomRouter.post(
  '/:roomId/merge',
  catchError(isAuth),
  catchError(isUserInRoom),
  catchError(roomController.mergeRooms),
);

roomRouter.post(
  '/:roomId/join',
  catchError(isAuth),
  catchError(roomController.joinRoom),
);
