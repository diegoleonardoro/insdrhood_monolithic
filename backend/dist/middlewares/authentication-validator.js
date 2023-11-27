"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationValidator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Add the "currentUser" property to the request body if there is a currently logged in user:
const authenticationValidator = async (req, res, next) => {
    if (!req.session?.jwt) {
        return next();
    }
    try {
        const payload = jsonwebtoken_1.default.verify(req.session.jwt, process.env.JWT_KEY);
        //---------------------------------------
        // if (payload.isVerified === false) {
        //   const loggedUser = await User.findOne({ email: payload.email });
        //   if (loggedUser?.isVerified === true) {
        //     payload.isVerified = true;
        //   }
        // }
        //---------------------------------------
        req.currentUser = payload;
    }
    catch (err) { }
    next();
};
exports.authenticationValidator = authenticationValidator;
//# sourceMappingURL=authentication-validator.js.map