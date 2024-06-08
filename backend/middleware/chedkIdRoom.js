const ApiError = require("../exeptions/api.error");
const { getRoom } = require("../services/room.services");

async function checkIdRoom(req, res, next) {
  const { idRoom } = req.params;

  if (!idRoom, isNaN(idRoom)) {
    throw ApiError.badRequest('Invalid id room');
  }

  const room = await getRoom(idRoom);

  if (!room) {
    throw ApiError.badRequest('Invalid id room');
  }

  next();
}

module.exports = checkIdRoom;
