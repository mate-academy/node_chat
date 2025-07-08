const prisma = require('../utils/db.js');

async function saveOrUpdateToken(userId, token) {
  return prisma.refreshToken.upsert({
    where: { userId },
    update: { token },
    create: { userId, token },
  });
}

async function findUnique(userId) {
  return prisma.refreshToken.findUnique({
    where: { userId },
  });
}

async function deleteToken(userId) {
  return prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

const refreshTokenRepository = {
  saveOrUpdateToken,
  findUnique,
  deleteToken,
};

module.exports = refreshTokenRepository;
