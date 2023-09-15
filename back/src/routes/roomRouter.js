/* eslint-disable quotes */
import express from "express";
import { roomController } from "../controllers/roomController.js";
import { catchError } from "../middlewares/catchError.js";

export const roomRouter = new express.Router();

roomRouter.get("/", catchError(roomController.getAll));

roomRouter.get("/:id", catchError(roomController.getRoomById));

roomRouter.post("/", catchError(roomController.createRoom));
roomRouter.patch("/rename", catchError(roomController.renameRoom));
roomRouter.delete("/:id", catchError(roomController.deleteRoom));
roomRouter.post("/merge", catchError(roomController.mergeRooms));
