const { services: jwtServices } = require('../services/jwt.service');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtServices.verify(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  req.user = userData;

  next();
};

module.exports = {
  authMiddleware,
};
