type Errors = Record<string, string | undefined> | undefined;

interface ApiErrorParams {
  message: string;
  status: number;
  errors?: Errors;
}

export class ApiError extends Error {
  status: number;
  errors: Errors;

  constructor({ message, status, errors }: ApiErrorParams) {
    super(message);

    this.status = status;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, errors?: Errors) {
    return new ApiError({
      message,
      status: 400,
      ...(errors && { errors }),
    });
  }

  static unauthorized(message: string, errors?: Errors) {
    return new ApiError({
      message,
      status: 401,
      ...(errors && { errors }),
    });
  }

  static forbidden(message: string = 'Access denied', errors?: Errors) {
    return new ApiError({
      message: message,
      status: 403,
      ...(errors && { errors }),
    });
  }

  static notFound(message: string = 'Not Found', errors?: Errors) {
    return new ApiError({
      message: message,
      status: 404,
      ...(errors && { errors }),
    });
  }

  static conflict(message: string, errors?: Errors) {
    return new ApiError({
      message,
      status: 409,
      ...(errors && { errors }),
    });
  }
}
