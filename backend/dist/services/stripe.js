"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeAPI = void 0;
const stripe_1 = __importDefault(require("stripe"));
exports.stripeAPI = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
//# sourceMappingURL=stripe.js.map