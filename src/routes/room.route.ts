import express from 'express';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const roomRouter = express.Router();

roomRouter.use(catchError(authMiddleware));

roomRouter.get('/', catchError(roomController.getAll));
roomRouter.get('/mine', catchError(roomController.getAllByUserId));
roomRouter.get('/:roomId', catchError(roomController.getOneById));

roomRouter.get(
  '/:roomId/members',
  catchError(roomController.getAllUserByRoomId),
);
roomRouter.post('/', catchError(roomController.create));
roomRouter.delete('/:roomId', catchError(roomController.delete));
roomRouter.patch('/:roomId', catchError(roomController.update));
roomRouter.post('/:roomId/members', catchError(roomController.addUser));

roomRouter.delete(
  '/:roomId/members/:userId',
  catchError(roomController.removeUser),
);

roomRouter.delete('/:roomId/leave', catchError(roomController.leave));

roomRouter.patch(
  '/:roomId/members/:userId/role',
  catchError(roomController.changeMemberRole),
);

roomRouter.patch(
  '/:roomId/members/:userId/transfer-ownership',
  catchError(roomController.transferOwnership),
);
