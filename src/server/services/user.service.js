const { User } = require('../models');

const userService = {
  login: async (userName) => {
    const user = await User.findOne({ name: userName });

    if (!user) {
      throw new Error('Not found user');
    }

    return user;
  },
  register: async (userName) => {
    const user = await User.create({ name: userName });

    return user;
  },
};

module.exports = {
  userService,
};
