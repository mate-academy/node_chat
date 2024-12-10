const { sequelize } = require('./utils/db');
const { User } = require('./models/user.model');

require('./models/token.model');
require('./models/message.model');

const { Room } = require('./models/room.model');

(async () => {
  try {
    await sequelize.sync({ alter: true });

    const firstUserData = {
      name: 'Bodya',
      email: 'test@gmail.com',
      password: '$2b$09$vXUnnK7qwX9keDAintwqd.LEaRanah6c1xOaTR7X2TAAv.vyZ3uO6',
      activationToken: null,
    };

    const roomData = { name: 'Global' };

    await sequelize.transaction(async (t) => {
      const user = await User.create(firstUserData, { transaction: t });

      await Room.create({ ...roomData, userId: user.id }, { transaction: t });
    });
  } catch (error) {
    throw error;
  }
})();
