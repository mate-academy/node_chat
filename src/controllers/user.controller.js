const { registerUser } = require('../services/user.service');

const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await registerUser({ username, email, password });

    res.status(201).send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = {
  createUser,
};
