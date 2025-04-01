const User = require('../models/user');

async function findById(id) {
  return User.findOne({
    where: { id },
  });
}

module.exports = {
  findById,
};
