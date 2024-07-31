const { initUsers } = require('../models/user.model');
const { initRooms } = require('../models/room.model');
const { initMessages } = require('../models/message.model');

class ServerUtils {
  catchError = (action) => {
    return async function (req, res, next) {
      try {
        await action(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  };
  initTables = async () => {
    await initUsers();
    await initRooms();
    await initMessages();
  };
}

const Utils = new ServerUtils();

module.exports = { Utils };
