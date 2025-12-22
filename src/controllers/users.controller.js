const { User } = require('../models/User.model');

const getAll = async (req, res) => {
  const users = await User.findAll();

  res.status(200).json(users);
};

const create = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const user = await User.create({ username });

  res.status(201).json(user);
};

const getById = async (req, res) => {
  const id = +req.params.id;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.status(200).json(user);
};

const remove = async (req, res) => {
  const id = +req.params.id;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: 'Not found' });
  }

  await user.destroy();

  res.sendStatus(204);
};

const update = async (req, res) => {
  const id = +req.params.id;
  const username = req.body.username;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (!username) {
    return res.status(400).json({ error: 'Bad request' });
  }

  await user.update({ username });

  res.status(200).json(user);
};

const usersController = {
  getAll,
  create,
  getById,
  remove,
  update,
};

module.exports = { usersController };
