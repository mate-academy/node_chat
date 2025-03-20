export class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unAuthorized(message = 'unAuthorized user', errors) {
    return new ApiError({
      message,
      errors,
      status: 401,
    });
  }

  static notFound(message = 'Resource not found', errors) {
    return new ApiError({
      message,
      errors,
      status: 404,
    });
  }

  static conflict(message = 'Resource conflict', errors) {
    return new ApiError({
      message,
      errors,
      status: 409,
    });
  }
}
