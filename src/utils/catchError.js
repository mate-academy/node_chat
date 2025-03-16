export const catchError = (action) => {
  return async (req, res, next) => {
    try {
      await action(req, res, next);
    } catch (er) {
      next(er);
    }
  };
};
