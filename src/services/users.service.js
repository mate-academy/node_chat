import { User } from '../model/model.js';

const getAllUsers = async () => {
  return User.findAll();
};

const getUserById = async (id) => {
  return User.findByPk(id);
};

const createUser = async (user) => {
  return User.create(user);
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  await user.destroy();

  return user;
};

const updateUser = async (id, user) => {
  const userToUpdate = await User.findByPk(id);

  if (!userToUpdate) {
    return null;
  }

  userToUpdate.username = user.username;
  await userToUpdate.save();

  return userToUpdate;
};

export const userService = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
};
