export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InternalServerError extends CustomError {
  statusCode = 500;
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}

export class ValidationError extends CustomError {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends CustomError {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends CustomError {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
