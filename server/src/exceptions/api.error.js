export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message = 'Bad request', errors) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized(message) {
    return new ApiError(401, message);
  }

  static NotFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static StatusConflict(message = 'A conflict with the current state of a resource') {
    return new ApiError(409, message);
  }

  static InvalidData(message = 'Unprocessable entity', errors) {
    return new ApiError(422, message, errors);
  }
};
