import express from 'express';
import {
  createRoom,
  deleteRoom,
  getOneRoom,
  getRooms,
  renameRoom,
} from '../controllers/room.controller.js';
import { catchError } from '../catcherrors.js';

export const roomsRoute = express.Router();

roomsRoute.get('/', catchError(getRooms));
roomsRoute.get('/:id', catchError(getOneRoom));
roomsRoute.post('/', catchError(createRoom));
roomsRoute.delete('/:id', catchError(deleteRoom));
roomsRoute.patch('/:id', catchError(renameRoom));
