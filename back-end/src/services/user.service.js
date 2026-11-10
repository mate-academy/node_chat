const users = require('../data/store');

function addUser(name) {
  users.push(name);
}

function getUser(name) {
  return users.find((user) => user === name);
}

module.exports = {
  addUser,
  getUser,
};
