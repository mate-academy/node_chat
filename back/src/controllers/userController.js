/* eslint-disable quotes */
import { userService } from "../services/userService.js";

async function createUser(req, res, next) {
  const { fullName } = req.body;
  const user = await userService.createUser(fullName);

  res.send(user);
}

async function getUserById(req, res, next) {
  const { id } = req.params;
  const user = await userService.getById(id);

  res.send(user);
}

export const userController = {
  createUser,
  getUserById,
};
