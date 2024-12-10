class ApiError extends Error {
  status;
  errors;

  constructor({ message, status, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = {}) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(errors = {}) {
    return new ApiError({
      message: 'unauthorized user',
      errors,
      status: 401,
    });
  }

  static forbidden(message, errors = {}) {
    return new ApiError({
      message: 'resource is forbidden',
      errors,
      status: 403,
    });
  }

  static notFound(errors = {}) {
    return new ApiError({
      message: 'not found',
      errors,
      status: 404,
    });
  }
}

module.exports = { ApiError };
