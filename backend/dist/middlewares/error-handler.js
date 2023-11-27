"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const custom_error_1 = require("../errors/custom-error");
// err is the class that we are extending
const errorHandler = (err, req, res, next) => {
    // every custom error should be an instance of the CustomError class 
    if (err instanceof custom_error_1.CustomError) {
        return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }
    console.error(err);
    res.status(500).send({
        errors: [{ message: "Something went wrong" }],
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.js.map