import express from "express";
import { usersController } from "../controllers/usersController.js";

export const usersRouter = express.Router();

usersRouter.get('/users', usersController.getAll);
usersRouter.post('/users/:name', usersController.checkOne);
usersRouter.post('/users', express.json(), usersController.createNew);
usersRouter.delete('/users', usersController.crearAll);