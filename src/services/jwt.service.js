const jwt = require('jsonwebtoken');

const services = {
  sign: (user) => {
    const token = jwt.sign(user, process.env.JWT_KEY);

    return token;
  },
  verify: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return null;
    }
  },
  signRefresh: (user) => {
    const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

    return token;
  },
  verifyRefresh: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_KEY);
    } catch (err) {
      return null;
    }
  },
};

module.exports = {
  services,
};
