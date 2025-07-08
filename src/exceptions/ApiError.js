class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static Unauthorized(message) {
    return new ApiError(401, message || 'User is not authorized');
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static NotFound(message) {
    return new ApiError(404, message || 'Not Found');
  }

  static Conflict(message) {
    return new ApiError(409, message || 'Conflict');
  }
}

module.exports = ApiError;
