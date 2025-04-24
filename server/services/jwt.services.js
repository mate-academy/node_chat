import jwt from 'jsonwebtoken';
import 'dotenv/config';

const { JWT_KEY, JWT_REFRESH_KEY } = process.env;

export function sign(user) {
  return jwt.sign(user, JWT_KEY || '', { expiresIn: '1h' });
}

export function verify(token) {
  try {
    return jwt.verify(token, JWT_KEY || '');
  } catch {
    return null;
  }
}

export function signRefresh(user) {
  return jwt.sign(user, JWT_REFRESH_KEY || '');
}

export function verifyRefresh(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_KEY || '');
  } catch {
    return null;
  }
}
