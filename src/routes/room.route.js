import express from 'express';
import { room } from '../controllers/room.js';
import { catchError } from '../utils/catchError.js';

export const roomRouter = new express.Router();

roomRouter.get('/rooms', catchError(room.getAllRooms));
roomRouter.post('/rooms', catchError(room.createRoom));
roomRouter.patch('/rooms/:id', catchError(room.renameRoom));
roomRouter.delete('/rooms/:id', catchError(room.deleteRoom));
