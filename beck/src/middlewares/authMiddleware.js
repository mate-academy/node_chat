/* eslint-disable no-console */
const Session = require('../models/Sesion');

const authMiddleware = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    console.log('trouble here -> no token');

    return res.status(401).end();
  }

  const session = await Session.findOne({ where: { token } });

  if (!session) {
    console.log('trouble here -> no session');

    return res.status(401).end();
  }

  req.userId = session.userId;

  next();
};

module.exports = authMiddleware;
