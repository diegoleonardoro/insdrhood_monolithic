"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationValidator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../database/repositories/auth");
// Add the "currentUser" property to the request body if there is a currently logged in user:
const authenticationValidator = async (req, res, next) => {
    if (!req.session?.jwt) {
        return next();
    }
    console.log('req.session.jwttttt===>>>>', req.session.jwt);
    try {
        const payload = jsonwebtoken_1.default.verify(req.session.jwt, process.env.JWT_KEY);
        const authRepo = new auth_1.AuthRepository();
        // here get use by email instead of id
        const existingUser = await authRepo.getUser(payload.email);
        const equal = compareKeyValuePairs(payload, existingUser);
        if (!equal) {
            const userInfo = {
                id: existingUser?._id.toString(),
                email: existingUser?.email,
                name: existingUser?.name,
                image: existingUser?.image,
                isVerified: existingUser?.isVerified,
                neighborhoodId: existingUser?.neighborhoodId,
                userImagesId: existingUser?.userImagesId,
                passwordSet: existingUser?.passwordSet,
            };
            // Generate JWT
            const userJwt = jsonwebtoken_1.default.sign(userInfo, process.env.JWT_KEY);
            // Store JWT on the session object created by cookieSession
            req.session = {
                jwt: userJwt,
            };
            if (existingUser) {
                req.currentUser = {
                    id: existingUser?._id.toString(),
                    name: userInfo.name,
                    email: userInfo.email,
                    isVerified: userInfo.isVerified,
                    passwordSet: existingUser?.passwordSet,
                    neighborhoodId: existingUser?.neighborhoodId,
                };
            }
        }
        else {
            req.currentUser = payload;
        }
    }
    catch (err) { }
    next();
};
exports.authenticationValidator = authenticationValidator;
function compareKeyValuePairs(payloadd, currentUser) {
    // Assuming dddd might use '_id' instead of 'id' for comparison
    const ddddComparable = { ...currentUser, id: currentUser._id ? currentUser._id.toString() : currentUser.id };
    // Directly compare key-value pairs
    for (let key in payloadd) {
        // Convert arrays to string for comparison to simplify array equality check
        let payloaddValue = Array.isArray(payloadd[key]) ? payloadd[key].toString() : payloadd[key];
        let ddddValue = Array.isArray(ddddComparable[key]) ? ddddComparable[key].toString() : ddddComparable[key];
        if (payloaddValue !== ddddValue) {
            return false;
        }
    }
    // If no differences were found
    return true;
}
//# sourceMappingURL=authentication-validator.js.map