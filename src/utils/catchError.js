'use strict';

const catchError = (action) => {
  return async(req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  catchError,
};
