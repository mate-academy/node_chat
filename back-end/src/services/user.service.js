import { User } from '../models/user.js';

const getUser = async (userName) => {
  const user = await User.findOne({
    where: {
      name: userName,
    },
  });

  if (!user) {
    const newUser = await User.create({
      name: userName,
    });

    return newUser;
  }

  return user;
};

export const userService = {
  getUser,
};
