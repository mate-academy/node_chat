const { User } = require('./../models/User.model.js');

const findOrCreateUser = async (name) => {
  const [user] = await User.findOrCreate({
    where: { name },
  }) ;

  return user;
}

module.exports = {
  findOrCreateUser,
}
