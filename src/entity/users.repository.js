const prisma = require('../utils/db.js');

async function createUser(name, password) {
  return prisma.user.create({
    data: {
      name,
      password,
    },
  });
}

async function getUserByName(name) {
  return prisma.user.findUnique({
    where: {
      name,
    },
  });
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

const usersRepository = {
  createUser,
  getUserByName,
  getUserById,
};

module.exports = usersRepository;
