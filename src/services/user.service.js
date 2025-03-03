import { User } from '../models/user.js';

async function create(username) {
  await User.create({
    name: username,
  });
}

export const userService = {
  create,
};
