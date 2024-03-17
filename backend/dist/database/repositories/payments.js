"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsRepository = void 0;
const stripe_1 = __importDefault(require("stripe"));
const bad_request_error_1 = require("../../errors/bad-request-error");
class PaymentsRepository {
    constructor(stripeSecretKey, baseUrl) {
        this.stripeAPI = new stripe_1.default(stripeSecretKey, { apiVersion: '2023-10-16' });
        this.domainUrl = baseUrl.split(' ')[0]; // Assuming the splitting logic is still relevant.
    }
    async createCheckoutSession(lineItems, customerEmail) {
        // Check if line items and email are provided
        if (!lineItems || !customerEmail) {
            throw new bad_request_error_1.BadRequestError('Missing required session parameters');
        }
        try {
            const session = await this.stripeAPI.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: lineItems,
                customer_email: customerEmail,
                success_url: `${this.domainUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${this.domainUrl}/canceled`,
                shipping_address_collection: { allowed_countries: ['GB', 'US'] }
            });
            return { sessionId: session.id };
        }
        catch (error) {
            console.error(error);
            throw new bad_request_error_1.BadRequestError('An error occurred, unable to create session');
        }
    }
}
exports.PaymentsRepository = PaymentsRepository;
//# sourceMappingURL=payments.js.map