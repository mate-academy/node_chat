/* eslint-disable quotes */
import { User } from "../models/user.js";

function getById(id) {
  return User.findOne({
    where: { id },
  });
}

async function createUser(fullName) {
  const newUser = await User.create({
    fullName,
  });

  return newUser;
}

export const userService = {
  getById,
  createUser,
};
