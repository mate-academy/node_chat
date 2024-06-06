const ApiError = require("../exeptions/api.error");
const { getUser } = require("../services/user.services");

async function checkPostMessageData(req, res, next) {
  const {idUser, message} = req.body;

  if (!message.trim() || isNaN(idUser)) {
    throw ApiError.badRequest('Invalid post data');
  }

  const user = await getUser(idUser);

  if (!user) {
    throw ApiError.badRequest('invalid user id')
  }

  next();
}

module.exports = checkPostMessageData;
