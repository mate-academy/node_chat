import express from 'express'
import { roomController } from '../controllers/room.controller.js'


export const roomRouter = new express.Router()

roomRouter.get('/get/:id', roomController.join);
roomRouter.post('/create', roomController.create);
roomRouter.delete('/remove/:id', roomController.remove);
roomRouter.patch('/rename/:id', roomController.rename);
