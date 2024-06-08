const ApiError = require("../exeptions/api.error");

function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    res.status(error.status).send(error.message);

    return;
  }

  next(error);
}

module.exports = errorHandler;
