'use strict';

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // eslint-disable-next-line no-console
  console.error(error);

  return res.status(500).json({
    message: 'Internal server error.',
  });
}

module.exports = errorHandler;
