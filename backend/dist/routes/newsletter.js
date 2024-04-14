"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsletter = void 0;
const express_1 = __importDefault(require("express"));
const newsletter_1 = require("../controllers/newsletter");
function asyncHandler(fn) {
    return function (req, res, next) {
        return Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}
const router = express_1.default.Router();
exports.newsletter = router;
router.post("/sendnewsletter", asyncHandler(newsletter_1.sendNewsLetter));
//# sourceMappingURL=newsletter.js.map