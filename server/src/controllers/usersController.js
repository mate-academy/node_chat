import { usersService } from '../service/usersService.js';

async function getAll(req, res) {
  try {
    const response = await usersService.findAll();

    if (!response || response.length === 0) {
      res.status(404).json('Users not found or empty');

      return;
    }

    res.status(200).json(response);
  } catch (err) {
    console.error(`catch error getAll: ${err.message}`);
    res.status(500).json('Server error');
  }
}

async function checkOne(req, res) {
  const userName = req.params.name;

  try {
    const existUser = await usersService.getOne(userName);

    if (existUser) {
      res.status(200).json(existUser.name);

      return;
    }

    const newUser = await usersService.addNew(userName);
    res.status(201).json(newUser.name);
  } catch (err) {
    console.error(`catch error getone: ${err.message}`);
    res.status(500).json('Server error');
  }
}

async function createNew(req, res) {
  const userName = req.body.name;

  if (!userName) {
    res.status(400).json('Invalid data request');

    return;
  }

  try {
    const response = await usersService.addNew(userName);

    if (!response) {
      res.status(500).json('Server error');

      return;
    } else {
      res.status(201).json(response);
    }
  } catch (err) {
    console.error(`catch error create new: ${err.message}`);
    res.status(500).json('Server error');
  }
}

async function crearAll(req, res) {
  await usersService.crear();

  res.sendStatus(204);
}

export const usersController = {
  getAll,
  checkOne,
  createNew,
  crearAll,
};
