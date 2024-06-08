class ApiError extends Error {
  constructor(message, status, error = {}) {
    super(message);

    this.status = status;
    this.error = error;
  };

  static badRequest(message) {
    return new ApiError(message, 400);
  };

  static notFound(message) {
    return new ApiError(message, 404);
  };

  static cannotRemove() {
    return new ApiError('Not removed', 400);
  }

  static serverError() {
    return new ApiError('server error', 500);
  };
}

module.exports = ApiError;
