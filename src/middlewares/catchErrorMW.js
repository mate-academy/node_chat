'use strict';

function catchErrorMW(action) {
  return async(req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('x catchErrorMW, error =', error);

      // redirect error to handleErrorsMW()
      next(error);
    }
  };
}

module.exports = { catchErrorMW };
