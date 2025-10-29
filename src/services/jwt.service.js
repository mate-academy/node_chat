import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sign(user) {
  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: '1h' });

  return token;
}

function signRefresh(user) {
  const token = jwt.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch {
    return null;
  }
}

export const jwtService = {
  sign,
  signRefresh,
  verify,
};
