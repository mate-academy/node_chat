const { Token } = require('../models/token.model');

const services = {
  save: async (userId, newToken) => {
    const token = await Token.findOne({ where: { userId } });

    if (!token) {
      await Token.create({ userId, refreshToken: newToken });

      return;
    }

    token.refreshToken = newToken;

    await token.save();
  },
  getByToken: (refreshToken) => {
    return Token.findOne({
      where: {
        refreshToken,
      },
    });
  },
  delete: async (userId) => {
    await Token.destroy({ where: { userId } });
  },
};

module.exports = {
  services,
};
