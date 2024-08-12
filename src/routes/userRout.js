import express from "express";
import * as userController from './../controllers/userController.js';
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.get('/user/:id', catchError(userController.getOne));

router.post('/user', express.json(), catchError(userController.create));

export { router };
