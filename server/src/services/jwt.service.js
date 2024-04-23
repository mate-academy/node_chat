const jwt = require('jsonwebtoken');

const generateTokens = (id) => {
  const jwtkey = process.env.JWT_SECRET;
  const accessToken = jwt.sign({ id }, jwtkey, { expiresIn: '3d' });
  const refreshToken = jwt.sign({ id }, jwtkey, { expiresIn: '30d' });

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  generateTokens,
};
