import { Token } from '../models/index.js';

async function getToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

async function removeToken(refreshToken) {
  await Token.destroy({ where: { refreshToken } });
}

async function saveToken(userId, newToken) {
  let token = await Token.findOne({ where: { userId } });

  if (!token) {
    token = await Token.create({ userId, refreshToken: newToken });
  } else {
    token.refreshToken = newToken;
    await token.save();
  }

  return token;
}

export const tokenService = {
  getToken,
  removeToken,
  saveToken,
};
