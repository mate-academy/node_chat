class WsError extends Error {
  constructor({ code, message, errors = {} }) {
    super(message);
    this.code = code;
    this.errors = errors;
  }

  static validationError(message, errors = {}) {
    return new WsError({
      code: 'VALIDATION_ERROR',
      message,
    });
  }

  static notFound(erorrs) {
    return new WsError({
      code: 'NOT_FOUND',
      message: 'Not Found',
      errors: erorrs,
    });
  }

  static forbidden(errors) {
    return new WsError({
      code: 'FORBIDDEN',
      message: 'Forbidden',
      errors,
    });
  }
}

module.exports = {
  WsError,
};
