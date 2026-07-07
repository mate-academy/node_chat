const { userService } = require('../services/user.service');

const userController = {
  login: async (req, res) => {
    try {
      const { userName } = req.body;
      const user = await userService.login(userName);

      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

  register: async (req, res) => {
    try {
      const { userName } = req.body;
      const user = await userService.register(userName);

      return res.status(201).json(user);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },
};

module.exports = {
  userController,
};
