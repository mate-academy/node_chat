import logger from './logger.js';

export const catchError = (action) => {
  return async function (req, res, next) {
    try {
      await action(req, res, next);
    } catch (error) {
      logger.error(`Error in action: ${error.message}`, { stack: error.stack });
      next(error);
    }
  };
};
