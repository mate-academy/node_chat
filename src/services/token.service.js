import { Token } from '../models/token.js';

async function save(userId, newToken) {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });
  } else {
    token.refreshToken = newToken;

    await token.save();
  }
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

export const tokenService = {
  save,
  getByToken,
};
