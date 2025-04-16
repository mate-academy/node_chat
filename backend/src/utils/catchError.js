function catchError(action) {
  return async function (req, res, next) {
    try {
      await action(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { catchError };
