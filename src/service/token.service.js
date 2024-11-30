/* eslint-disable no-useless-return */
import { Token } from '../modules/Token.js';

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

async function getByToken(refreshToken) {
  const check = await Token.findOne({ where: { refreshToken } });

  return check;
}

async function remove(userId) {
  const destroy = await Token.destroy({ where: { userId } });

  return destroy;
}

export const tokenService = {
  save,
  getByToken,
  remove,
};
