'use strict';

class ErrorApi extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ErrorApi(400, message, errors);
  }

  static Conflict() {
    return new ErrorApi(409, 'This user already online');
  }

  static NotFound(target) {
    return new ErrorApi(404, `Not found ${target}`);
  }
}

module.exports = { ErrorApi };
