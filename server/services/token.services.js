// @ts-nocheck
import { Token } from '../models/token.js';

export async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
}

export function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

export const remove = (userId) => {
  return Token.destroy({ where: { userId } });
};
