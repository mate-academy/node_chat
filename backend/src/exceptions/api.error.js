class ApiError extends Error {
  constructor({ status, message, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = {}) {
    return new ApiError({
      status: 400,
      message,
      errors,
    });
  }

  static notFound(errors) {
    return new ApiError({
      status: 404,
      message: 'Not Found',
      errors,
    });
  }
}

module.exports = ApiError;
