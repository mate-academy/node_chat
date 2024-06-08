const { User } = require("../module/user.module.js");

function createUser(username) {
  return User.create({ username });
};

function getUser(id) {
  return User.findByPk(id);
}

function removeUser(id) {
  return User.destroy({
    where: { id },
  });
}

module.exports = {
  createUser,
  getUser,
  removeUser
}
