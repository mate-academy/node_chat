function middlewareErrorHandler(callback) {
  return async function(req, res, next) {
    try {
      await callback(req, res, next);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = {
  middlewareErrorHandler
}
