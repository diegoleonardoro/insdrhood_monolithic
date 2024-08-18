"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const express_1 = __importDefault(require("express"));
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
router.post("/sendChatInfo", asyncHandler(chat_1.SendChatNotifications));
router.post("/chatSummary", chat_1.SendChatHistory);
//# sourceMappingURL=chat.js.map