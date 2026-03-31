export class ApiError extends Error {
  status;
  errors;

  constructor({ message, status, errors = {} }) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({ message, status: 400, errors });
  }

  static unauthorized(message = 'Unathorized user', errors) {
    return new ApiError({ message, status: 401, errors });
  }

  static forbidden(message = 'Forbidden', errors) {
    return new ApiError({ message, status: 403, errors });
  }

  static notFound(message = 'Not found', errors) {
    return new ApiError({ message, status: 404, errors });
  }
}
