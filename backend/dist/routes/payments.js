"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payments = void 0;
const express_1 = __importDefault(require("express"));
const payments_1 = require("../controllers/payments");
const router = express_1.default.Router();
exports.payments = router;
router.post('/create-checkout-session', payments_1.createCheckoutSession);
router.post('/webhook', payments_1.stripeWebhooks);
//# sourceMappingURL=payments.js.map