const ApiError = require("../exeptions/api.error");

function checkRoomName(req, res, next) {
  const { roomname } = req.body;

  if (!roomname || roomname.trim() === '') {
    throw ApiError.badRequest('Room name icorect');
  }

  next();
}

module.exports = checkRoomName;
