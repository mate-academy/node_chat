export const catchError = (action) => {
  return async function (req, res, next) {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
