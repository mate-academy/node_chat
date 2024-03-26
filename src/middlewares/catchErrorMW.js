'use strict';

function catchErrorMW(action) {
  return async(req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      // redirect error to handleErrorsMW()
      next(error);
    }
  };
}

module.exports = { catchErrorMW };
