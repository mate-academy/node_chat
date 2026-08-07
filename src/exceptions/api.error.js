class ApiError extends Error {
  // eslint-disable-next-line no-shadow
  constructor({ message, status, errors = [] }) {
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

  static unauthorized(errors) {
    return new ApiError({
      message: 'Unauthorized User',
      errors,
      status: 401,
    });
  }

  static forbidden(errors) {
    return new ApiError({
      message: 'Forbidden',
      errors,
      status: 403,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'Not Found',
      errors,
      status: 404,
    });
  }
}

module.exports = {
  ApiError,
};
