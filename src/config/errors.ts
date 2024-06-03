export class CustomError extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Not Found') {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database Error') {
    super(500, message);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class CacheError extends CustomError {
  constructor(message: string = 'Cache Error') {
    super(500, message);
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}
