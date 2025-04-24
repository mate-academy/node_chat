// @ts-nocheck
import { Op } from 'sequelize';
import { ApiError } from '../exeptions/api.error.js';
import { Users } from '../models/users.js';
import { sendUpdateEmailEmail } from './email.service.js';

export const normalize = ({ id, email, userName }) => {
  return { id, userName, email };
};

export const getAllUser = () => Users.findAll();
export const getUserById = (id) => Users.findByPk(id);

export const getUserByEmail = (email) => Users.findOne({ where: { email } });

export const getUsersByIds = (ids) => {
  return Users.findAll({
    where: {
      id: {
        [Op.in]: ids,
      },
    },
  });
};
export const getUserByUserName = (userName) =>
  Users.findOne({ where: { userName } });

export const getUserByActivationToken = (token) =>
  Users.findOne({
    where: { activationToken: token },
  });

export const getUserByPassResetToken = (token) =>
  Users.findOne({
    where: { resetToken: token },
  });

export const updateUserPassword = (user, password) => {
  user.resetToken = null;
  user.password = password;

  return user.save();
};

export const updateCurrentUserName = async (userId, name) => {
  const user = await getUserById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  user.name = name;

  return user.save();
};

export const updateCurrentUserEmail = async (
  user,
  email,
  confirmEmail,
  activationToken
) => {
  if (!user) {
    throw ApiError.notFound();
  }

  await sendUpdateEmailEmail(email, confirmEmail, activationToken);

  user.email = email;
  user.activationToken = activationToken;

  return user.save();
};
