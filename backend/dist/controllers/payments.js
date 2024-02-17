"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = void 0;
// import { stripeAPI } from "../services/stripe";
const stripe_1 = __importDefault(require("stripe"));
// export const stripeAPI = new Stripe(process.env.STRIPE_SECRET_KEY!);
// console.log('process.env.STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY)
/**
 * @description registers a new user
 * @route POST /api/payments/create-checkout-session
 * @access public
*/
const createCheckoutSession = async (req, res) => {
    console.log("create-checkout-session ROUTE HIT");
    const stripeAPI = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    console.log("STRIPE API", stripeAPI);
    const domainUrl = process.env.BASE_URL;
    console.log("DOMAIN URL", domainUrl);
    const { line_items, customer_email } = req.body;
    // check req body has line items and emai
    if (!line_items || !customer_email) {
        return res.status(400).json({ error: 'missing required session parameters' });
    }
    ;
    let session;
    try {
        session = await stripeAPI.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            customer_email,
            success_url: `${domainUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainUrl}/canceled`,
            shipping_address_collection: { allowed_countries: ['GB', 'US'] }
        });
        res.status(200).json({ sessionId: session.id, });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: 'an error occured, unable to create session' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
//# sourceMappingURL=payments.js.map