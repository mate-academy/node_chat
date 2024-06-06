const ApiError = require("../exeptions/api.error");

function checkUserName(req, res, next) {
  const { userName } = req.body;

  if (!userName || userName.trim() === '') {
    throw ApiError.badRequest('User name icorect');
  }

  next();
}

module.exports = checkUserName;
