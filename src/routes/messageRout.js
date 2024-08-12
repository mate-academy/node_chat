import express from "express";
import * as messageController from './../controllers/messageController.js';
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.get('/message/:id', catchError(messageController.get));
router.post('/message', express.json(), catchError(messageController.create));

export { router };
