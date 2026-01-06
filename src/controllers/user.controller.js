import { userService } from '../services/users.service.js';

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAll();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = +req.params.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const user = await userService.getById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const user = await userService.createUser({ username });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = +req.params.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const user = await userService.deleteUser(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = +req.params.id;
    const { username } = req.body;

    if (isNaN(id) || !username) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const user = await userService.updateUser(id, { username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const userController = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
};
