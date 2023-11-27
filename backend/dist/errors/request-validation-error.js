"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidationError = void 0;
const custom_error_1 = require("./custom-error");
class RequestValidationError extends custom_error_1.CustomError {
    constructor(errors) {
        super("Invalid request parameters"); // will be print on terminal 
        this.errors = errors;
        // using the private key word, makes it a property to the overall class private
        this.statusCode = 400;
        // Necessary because we are extending a built in class with TS:
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }
    serializeErrors() {
        return this.errors.map((err) => {
            return { message: err.msg };
        });
    }
}
exports.RequestValidationError = RequestValidationError;
//# sourceMappingURL=request-validation-error.js.map