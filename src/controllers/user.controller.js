import { roomService } from '../services/room.service.js';
import { userService } from '../services/user.service.js';

const createUser = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const newUser = await userService.createUser(name);

  res.status(201).json(newUser);
};

const getUserInfo = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'Id is required' });
  }

  const user = await userService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const rooms = await roomService.findRoomsByUserId(user.id);
  const userInfo = {
    user: { id: user.id, name: user.name, createdAt: user.createdAt },
    rooms,
  };

  res.status(200).json(userInfo);
};

const changeUserName = async (req, res) => {
  const user = req.user;
  const { newName } = req.body;

  if (!user) {
    return res.status(404).json({ message: 'User not Found' });
  }

  if (!newName) {
    return res.status(400).json({ message: 'No new name provided' });
  }

  user.name = newName;

  await user.save();

  res.status(200).json({ id: user.id, userName: user.name });
};

const deleteUser = async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(404).json({ message: 'User not Found' });
  }

  await user.destroy();

  req.user = null;

  res.status(200).json({ message: 'User deleted successfully' });
};

export const userController = {
  createUser,
  getUserInfo,
  changeUserName,
  deleteUser,
};
