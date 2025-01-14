import express from 'express';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';

export const roomRoute = new express.Router();

roomRoute.get('/', catchError(roomController.getAllRooms));
roomRoute.post('/', catchError(roomController.create));
roomRoute.put('/:id', catchError(roomController.rename));
roomRoute.delete('/:id', catchError(roomController.remove));
