const { registerUser } = require('../services/user.service');

const createUser = async (req, res) => {
  const { name } = req.body;

  const user = await registerUser(name);

  res.send(user);
};

module.exports = {
  createUser,
};
