import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
    // using the private key word, makes it a property to the overall class private

    statusCode = 400;
    constructor(public errors: ValidationError[]) {
        super("Invalid request parameters");// will be print on terminal 

        // Line because we are extending a built in class with TS:
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serializeErrors() {
        return this.errors.map((err) => {
            return { message: err.msg };
        });
    }

}
