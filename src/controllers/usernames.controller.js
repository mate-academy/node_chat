import { Username } from '../models/Username.js';

const createUser = async (req, res) => {
  const { username } = req.body;

  const newUsername = await Username.create({
    username,
  });

  res.send(newUsername);
};

export const usernameController = {
  createUser,
};
