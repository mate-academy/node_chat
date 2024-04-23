class ApiError extends Error {
  constructor(code, message, errors = {}) {
    super(message);

    this.code = code;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static NotFound() {
    return new ApiError(404, 'Not Found');
  }

  static Unauthorized() {
    return new ApiError(401, 'Unauhtorized');
  }

  static Validation(message, errors) {
    return new ApiError(422, message, errors);
  }
}

module.exports = ApiError;
