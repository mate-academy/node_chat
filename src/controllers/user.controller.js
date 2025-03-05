import * as userService from '../services/user.service.js';

const create = async (req, res) => {
  const { userName } = req.body;

  if (!userName) {
    res.sendStatus(404);

    return;
  }

  const newUser = await userService.createUser(userName);

  res.statusCode = 201;
  res.send(userService.normalize(newUser));
};

module.exports = {
  create,
};
