const usersRepository = require('../entity/users.repository');
const { normalize } = require('../service/validation.service');

async function getUser(req, res) {
  const { userId } = req.params;

  const user = await usersRepository.getUserById(userId);

  const normalizedUser = normalize(user);

  res.json(normalizedUser);
}

const usersController = {
  getUser,
};

module.exports = usersController;
