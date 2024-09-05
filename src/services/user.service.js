const { User } = require('../models/user');

function findById(id) {
  return User.find({
    where: { id },
  });
}

async function registerUser(name) {
  const user = await User.create({
    name,
  });

  return user;
}

module.exports = {
  registerUser,
  findById,
};
