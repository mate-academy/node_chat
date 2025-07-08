function catchError(action) {
  return async (res, req, next) => {
    try {
      await action(res, req, next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = catchError;
