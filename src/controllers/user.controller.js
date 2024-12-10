const userService = require('../services/user.service');

const getAll = async (req, res) => {
  const users = await userService.getAll();

  res.send(users);
};

module.exports = { getAll };
