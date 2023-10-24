"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../mddlewares/validate-request");
const router = express_1.default.Router();
exports.auth = router;
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email must be valid"),
    (0, express_validator_1.body)("password").trim().notEmpty().withMessage("You must supply a password"),
], validate_request_1.validateRequest); //login controller
router.post("/signup"); //signup controller
router.post("/signout"); //signout controller
router.get("/currentuser"); //currentuser controller
router.put("/updateuser"); // updateuser controller
router.put("/confirmemail"); // confirmemail controller
