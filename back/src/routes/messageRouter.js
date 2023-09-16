/* eslint-disable quotes */
import express from "express";
import { messageController } from "../controllers/messageController.js";
import { catchError } from "../middlewares/catchError.js";

export const messageRouter = new express.Router();

messageRouter.get("/", catchError(messageController.getAll));
messageRouter.get("/:roomId", catchError(messageController.getAllForRoom));
