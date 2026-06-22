import { User } from '../models/index.js';

export const loginUser = async (username) => {
  const [user] = await User.findOrCreate({
    where: { username: username },
  });

  return user;
};

export const userService = {
  loginUser,
};
