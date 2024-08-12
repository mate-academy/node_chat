import express from "express";
import * as roomController from './../controllers/roomController.js';
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.get('/room/', catchError(roomController.get));
router.get('/room/:id', catchError(roomController.getOne));
router.post('/room', express.json(), catchError(roomController.create));
router.patch('/room/:id', express.json(), catchError(roomController.update));
router.post('/room/:id', express.json(), catchError(roomController.join));
router.delete('/room/:id', catchError(roomController.remove));

export { router };
