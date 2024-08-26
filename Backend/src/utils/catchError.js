const catchError = (handlerFunction) => {
  return async function (req, res, next) {
    try {
      await handlerFunction(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  catchError,
};
