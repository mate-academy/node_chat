import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  //  console.error('❌ Error caught by middleware:', error);

  if (error instanceof ApiError) {
    return res.status(error.status || 400).json({
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).json({
    message: 'Server error',
  });
};
