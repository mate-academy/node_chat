const UserService = require('../services/User.service.js');
const { tryCatch } = require('../utils.js');
const getAll = tryCatch(async (req, res) => {
  const users = await UserService.getAll();

  res.status(200).send(users);
});

module.exports = { getAll };
