import { ApiError } from '../exeptions/api.error.js';

export const validateMiddleware = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return next(
      ApiError.badRequest(
        'Validation error',
        error.details.map((err) => err.message),
      ),
    );
  }

  next();
};
