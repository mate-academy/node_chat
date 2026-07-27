const { services: userService } = require('../models/users.model');

const controller = {
  getAll: async (req, res) => {
    const users = await userService.getAll();

    res.send(users);
  },
  getById: async (req, res) => {
    const user = await userService.getById(req.params.id);

    res.send(user);
  },
};

module.exports = { controller };
