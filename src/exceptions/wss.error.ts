interface WssErrorParams {
  message: string;
  code: number;
}

export class WssError extends Error {
  code: number;

  constructor({ message, code }: WssErrorParams) {
    super(message);
    this.code = code;

    Object.setPrototypeOf(this, WssError.prototype);
  }

  static unauthorized(message = 'Unauthorized') {
    return new WssError({ message, code: 1008 });
  }

  static unsupported(message = 'Unsupported data') {
    return new WssError({ message, code: 1003 });
  }

  static notFound(message = 'Not found') {
    return new WssError({ message, code: 1009 });
  }

  static forbidden(message = 'Access denied') {
    return new WssError({ message, code: 1008 });
  }

  static conflict(message = 'Conflict') {
    return new WssError({ message, code: 1010 });
  }
}
