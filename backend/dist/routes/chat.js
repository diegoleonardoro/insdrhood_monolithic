"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const express_1 = __importDefault(require("express"));
const authentication_validator_1 = require("../middlewares/authentication-validator");
const chat_1 = require("../controllers/chat");
const router = express_1.default.Router();
exports.chat = router;
function asyncHandler(fn) {
    return function (req, res, next) {
        return Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}
// base route: /api/chat
router.post("/sendChatInfo", authentication_validator_1.authenticationValidator, asyncHandler(chat_1.SendChatNotifications));
//# sourceMappingURL=chat.js.map