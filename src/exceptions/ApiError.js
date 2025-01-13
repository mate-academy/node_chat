export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    if (typeof status !== 'number') {
      throw new TypeError('Status must be a number');
    }

    if (typeof message !== 'string') {
      throw new TypeError('Message must be a string');
    }
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message = 'Bad request', errors = {}) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized(message = 'User is not authorized', errors = {}) {
    return new ApiError(401, message, errors);
  }

  static Forbidden(message = 'Access forbidden', errors = {}) {
    return new ApiError(403, message, errors);
  }

  static NotFound(message = 'Not found', errors = {}) {
    return new ApiError(404, message, errors);
  }

  static Conflict(message = 'Conflict occurred', errors = {}) {
    return new ApiError(409, message, errors);
  }

  static UnprocessableEntity(errors = {}) {
    return new ApiError(422, 'Unprocessable Entity', errors);
  }

  toString() {
    return `ApiError: ${this.status} - ${this.message} | Details: ${JSON.stringify(this.errors)}`;
  }
}
