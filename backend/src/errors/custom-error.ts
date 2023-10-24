export abstract class CustomError extends Error {
  // this is saying that if we are extending CustomError, it needs to have statusCode.
  abstract statusCode: number;

  constructor(message: string) {
    // pass the message to the error
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  
  }
  abstract serializeErrors(): { message: string; field?: string }[];
}