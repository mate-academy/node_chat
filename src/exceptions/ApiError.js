'use strict';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static Unauthorized() {
    return new ApiError(401, 'User not authorized');
  }

  static NotFound(message) {
    return new ApiError(404, message);
  }

  static BadRequest(message) {
    return new ApiError(400, message);
  }
}

module.exports = { ApiError };
