import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  
  statusCode = 400;


  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  };

  serializeErrors() {
     console.log("this.message", this.message)
    return [{ message: this.message }];
  };

}