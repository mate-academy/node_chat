/* eslint-disable no-console */
const { userService } = require('../service/user.service');

const register = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send('Name and password are required');
  }

  try {
    const existingUser = await userService.findByName(name);

    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const user = await userService.register(name, password);

    res.status(201).send(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send('Name and password are required');
  }

  try {
    const user = await userService.findByName(name);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.password !== password) {
      return res.status(401).send('Invalid credentials');
    }

    res.status(200).send(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.findById(id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    await userService.deleteUser(id);
    res.sendStatus(204);
  } catch (error) {
    console.error('Deletion error:', error);
    res.status(500).send('Server error');
  }
};

const getNameById = async (req, res) => {
  const { id } = req.params;

  try {
    const userName = await userService.getNameById(id);

    if (userName) {
      res.status(200).send(userName);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).send('Server error');
  }
};

const userController = {
  register,
  login,
  deleteUser,
  getNameById,
};

module.exports = {
  userController,
};
