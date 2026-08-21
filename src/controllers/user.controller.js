const { services: userService } = require('../models/users.model');

const controller = {
  getAll: async (req, res) => {
    const users = await userService.getAll();

    res.send(users.map(userService.normalize));
  },
  getById: async (req, res) => {
    const user = await userService.getById(req.params.id);

    res.send(userService.normalize(user));
  },
};

module.exports = { controller };
