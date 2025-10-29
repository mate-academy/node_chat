export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }

  static badRequest(errors) {
    return new ApiError(400, 'Bad request', errors);
  }

  static notFound(errors) {
    return new ApiError(404, 'Not found', errors);
  }

  static unauthorized(errors) {
    return new ApiError(401, 'Unauthorized user', errors);
  }

  static forbidden(errors) {
    return new ApiError(403, 'Forbidden', errors);
  }
}
