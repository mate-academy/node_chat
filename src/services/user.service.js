import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { jwtService } from './jwt.service.js';

function findByUserName(username) {
  return User.findOne({ where: { username } });
}

function normalize({ id, username }) {
  return { id, username };
}

async function createUser(username) {
  const existUser = await User.findOne({ where: { username } });

  if (existUser) {
    throw ApiError.badRequest('User already exist');
  }

  await User.create({ username });
}

async function getUser(req) {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.notFound();
  }

  const user = await findByUserName(userData.username);

  return user;
}

export const userService = {
  findByUserName,
  normalize,
  createUser,
  getUser,
};
