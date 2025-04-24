export class ApiError extends Error {
  constructor({ messsage, status, errors = {} }) {
    super(messsage);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(messsage, errors) {
    return new ApiError({ messsage, errors, status: 400 });
  }

  static unauthorized(errors) {
    return new ApiError({ messsage: 'Unathorized user', errors, status: 401 });
  }
  static wrongPassword(errors) {
    return new ApiError({ messsage: 'Wrong Password', errors, status: 401 });
  }

  static unactivated(errors) {
    return new ApiError({
      messsage: 'Not activated User',
      status: 401,
      errors,
    });
  }

  static notFound(errors) {
    return new ApiError({ messsage: 'Not found', errors, status: 404 });
  }
}
