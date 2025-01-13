import express from 'express';
import * as roomController from '../controllers/room.controller.js';
import { catchError } from '../utils/catchError.js';

const router = express.Router();

router.get('/room/', catchError(roomController.getRooms));

router.get('/room/:id', catchError(roomController.getRoomById));

router.post('/room', express.json(), catchError(roomController.createRoom));

router.patch(
  '/room/:id',
  express.json(),
  catchError(roomController.updateRoom),
);

router.post(
  '/room/:id/join',
  express.json(),
  catchError(roomController.joinRoom),
);

router.delete('/room/:id', catchError(roomController.deleteRoom));

export { router };
