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

  static forbidden(message, errors) {
    return new ApiError({
      message,
      errors,
      status: 403,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'Not found',
      errors,
      status: 404,
    });
  }

  static conflict(errors) {
    return new ApiError({
      message: 'Conflict',
      errors,
      status: 409,
    });
  }
}
