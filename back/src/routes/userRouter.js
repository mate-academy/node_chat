/* eslint-disable quotes */
import express from "express";
import { userController } from "../controllers/userController.js";
import { catchError } from "../middlewares/catchError.js";

export const userRouter = new express.Router();

userRouter.get(
  "/:id",
  catchError(userController.getUserById)
);

userRouter.post(
  "/",
  catchError(userController.createUser)
);
