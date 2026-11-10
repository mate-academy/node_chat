const { users } = require('../data/store');

const createUser = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: 'Username is required',
    });
  }

  if (users.includes(name.trim())) {
    return res.status(409).json({
      message: 'User already exists',
    });
  }

  users.push(name);

  res.status(201).send(name);
};

module.exports = {
  createUser,
};
