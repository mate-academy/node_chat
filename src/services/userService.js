'use strict';

const { User } = require('../models/User.js');

function normalize({ id, name }) {
  return {
    id, name,
  };
}

function getByName(name) {
  return User.findOne({
    where: { name },
  });
}

async function createByName(name) {
  const newUser = await User.create({
    name,
  });

  return newUser;
}

async function getAllNames() {
  const users = await User.findAll({ attributes: ['name'] });

  return users.map(user => user.name);
}

const userService = {
  normalize,
  getByName,
  createByName,
  getAllNames,
};

module.exports = { userService };
