// @ts-nocheck
import { ApiError } from '../exeptions/api.error.js';
import { verifyRefresh } from '../services/jwt.services.js';
import { getByToken } from '../services/token.services.js';
import {
  getUserById,
  getUsersByIds,
  normalize,
  updateCurrentUserEmail,
  updateCurrentUserName,
} from '../services/user.services.js';
import { validateUserEmail } from '../utils/validator.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const getCurrentUser = async (req, res) => {
  const { userId } = req.params;

  const user = await getUserById(userId);
  if (!user) {
    throw ApiError.notFound();
  }

  res.send(normalize(user));
};

export const getAllUserByIds = async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    throw ApiError.badRequest('ids is required');
  }

  const users = await getUsersByIds(JSON.parse(ids));
  if (!users) {
    res.send([]);

    return;
  }

  res.send(users.map((user) => normalize(user)));
};
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, confirmEmail, password } = req.body;
  const { refreshToken } = req.cookies;
  const userData = await verifyRefresh(refreshToken);
  const token = await getByToken(refreshToken);

  if (!userData || !token || userData.id !== userId) {
    throw ApiError.unauthorized();
  }

  if (name) {
    const user = await updateCurrentUserName(userId, name);

    res.send(normalize(user));

    return;
  }

  if (email) {
    const user = await updateUserEmail(userId, email, confirmEmail, password);

    res.send(normalize(user));

    return;
  }

  res.sendStatus(422);
};

export const updateUserEmail = async (
  userId,
  email,
  confirmEmail,
  password
) => {
  const nonValidEmails = validateUserEmail({ email, confirmEmail });

  if (nonValidEmails) {
    throw ApiError.badRequest();
  }

  const user = await getUserById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.wrongPassword();
  }

  const activationToken = uuidv4();

  return updateCurrentUserEmail(user, email, confirmEmail, activationToken);
};
