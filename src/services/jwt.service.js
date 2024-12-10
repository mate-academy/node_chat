const jwt = require('jsonwebtoken');

require('dotenv').config();

const REFRESH_SECRET = process.env.JWT_REFRESH;
const ACCESS_SECRET = process.env.JWT_ACCESS;

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_SECRET, { expiresIn: '120s' });
}

function validateAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_SECRET, { expiresIn: '10d' });
}

function validateRefreshToken(refreshToken) {
  try {
    return jwt.verify(refreshToken, REFRESH_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};
