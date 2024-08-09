"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotions = void 0;
const express_1 = __importDefault(require("express"));
const authentication_validator_1 = require("../middlewares/authentication-validator");
const promotions_1 = require("../controllers/promotions");
const router = express_1.default.Router();
exports.promotions = router;
function asyncHandler(fn) {
    return function (req, res, next) {
        return Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}
// base route: /api/promotions
router.post("/addPromotions", authentication_validator_1.authenticationValidator, asyncHandler(promotions_1.insertsPromotionsToDb));
//# sourceMappingURL=promotions.js.map