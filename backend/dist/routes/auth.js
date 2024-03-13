"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../middlewares/validate-request");
const authentication_validator_1 = require("../middlewares/authentication-validator");
const auth_1 = require("../controllers/auth");
function asyncHandler(fn) {
    return function (req, res, next) {
        return Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}
const router = express_1.default.Router();
exports.auth = router;
/**
* AUTHENTICATION ROUTES:
*/
router.post("/signin", [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email must be valid"),
    (0, express_validator_1.body)("password").trim().notEmpty().withMessage("You must supply a password"),
], validate_request_1.validateRequest, asyncHandler(auth_1.login));
router.post("/signup", asyncHandler(auth_1.signup));
router.post("/signout", asyncHandler(auth_1.signout));
router.get("/currentuser", authentication_validator_1.authenticationValidator, asyncHandler(auth_1.currentuser));
router.get("/emailVerification/:emailtoken", asyncHandler(auth_1.verifyemail));
router.put("/updateuserdata/:id", authentication_validator_1.authenticationValidator, asyncHandler(auth_1.updateUserData));
router.post("/newsletter/signup", asyncHandler(auth_1.newsLetterSignUp));
/**
 * NEIGHBORHOOD DATA ROUTES:
*/
router.get("/neighborhood/imageupload/:neighborhood/:randomUUID", auth_1.uploadFile);
router.get("/blog/:randomUUID", auth_1.uploadBlogFiles);
router.post("/neighborhood/savedata", authentication_validator_1.authenticationValidator, auth_1.saveNeighborhoodData);
router.put("/updateneighborhood/:id", authentication_validator_1.authenticationValidator, auth_1.updateNeighborhoodData);
router.get("/neighborhoods", auth_1.getAllNeighborhoods);
router.get("/neighborhood/:neighborhoodid", auth_1.getNeighborhood);
//# sourceMappingURL=auth.js.map