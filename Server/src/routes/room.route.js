import express from "express";
import { roomControler } from "../controlers/room.controler.js";

export const roomRouter = new express.Router()
roomRouter.get('/rooms', roomControler.getAll)
roomRouter.post('/rooms/create', roomControler.create)
roomRouter.patch('/rooms/:roomId', roomControler.renameRoom)
roomRouter.delete('/rooms/:roomId', roomControler.deleteRoom)
