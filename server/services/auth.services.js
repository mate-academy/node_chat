// @ts-nocheck
import { Users } from '../models/users.js';
import { v4 as uuidv4 } from 'uuid';
import {
  getUserByActivationToken,
  getUserByEmail,
  getUserByPassResetToken,
  updateUserPassword,
  getUserByUserName,
  getAllUser,
} from './user.services.js';
import { ApiError } from '../exeptions/api.error.js';
import { sendActivationEmail, sendPassResetEmail } from './email.service.js';

export const createUser = async (email, password, userName) => {
  const activationToken = uuidv4();
  const emailExist = await getUserByEmail(email);
  const userNameExist = await getUserByUserName(userName);
  const users = await getAllUser(userName);

  if (emailExist) {
    throw ApiError.badRequest('Email already exist', {
      email: 'Email already exist',
    });
  }

  if (userNameExist) {
    throw ApiError.badRequest('User name already exist', {
      userName: 'User name already exist',
    });
  }

  await Users.create({
    email,
    password,
    userName,
    activationToken,
  });

  await sendActivationEmail(email, activationToken);
};

export const sendResetUserPassword = async (email) => {
  const resetToken = uuidv4();
  const user = await getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No user with this email');
  }

  await sendPassResetEmail(email, resetToken);

  user.resetToken = resetToken;

  const res = await user.save();

  return res;
};

export const resetPassword = async (password, resetToken) => {
  const user = await getUserByPassResetToken(resetToken);

  if (!user) {
    throw ApiError.notFound();
  }

  return updateUserPassword(user, password);
};

export const activateUser = async (activationToken) => {
  const user = await getUserByActivationToken(activationToken);

  if (!user) {
    return user;
  }

  user.activationToken = null;

  const res = await user.save();

  return res;
};
