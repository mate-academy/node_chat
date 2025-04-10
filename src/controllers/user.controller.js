import * as userService from '../services/user.service.js';

export const create = async (req, res) => {
  const { userName } = req.body;

  if (!userName) {
    res.sendStatus(404);

    return;
  }

  const newUser = userService.createUser(userName);

  res.statusCode = 201;
  res.send(userService.normalize(newUser));
};
