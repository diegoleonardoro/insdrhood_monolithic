"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhooks = exports.handleCheckoutSuccess = exports.createCheckoutSession = void 0;
// import { BadRequestError } from "../errors/bad-request-error";
const stripe_1 = require("../services/stripe");
const payments_1 = require("../database/repositories/payments");
const orders_1 = require("../database/repositories/orders");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../database/index");
const emailVerification_1 = require("../services/emailVerification");
const paymentsRepository = new payments_1.PaymentsRepository(process.env.STRIPE_SECRET_KEY, process.env.BASE_URL);
/**
 * @description creates checkout session
 * @route POST /api/payments/create-checkout-session
 * @access public
*/
const createCheckoutSession = async (req, res) => {
    const { customer_email, price_id } = req.body;
    const baseUrl = (process.env.BASE_URL || '').split(' ')
        .find(url => {
        try {
            new URL(url);
            return true;
        }
        catch (_) {
            return false;
        }
    });
    if (!baseUrl) {
        return res.status(500).json({ error: 'Invalid BASE_URL configuration' });
    }
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price_id,
                    quantity: 1,
                },
            ],
            customer_email: customer_email,
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/canceled`,
            metadata: {
                customer_email: customer_email,
            },
        });
        res.json({ sessionId: session.id });
    }
    catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
/**
 * @description confirms the success of the checkout
 * @route GET /api/payments/handle-checkout-success
 * @access public
*/
const handleCheckoutSuccess = async (req, res) => {
    const sessionId = req.query.session_id;
    const db = await (0, index_1.connectToDatabase)();
    const usersCollection = db.collection('users');
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            const token = jsonwebtoken_1.default.sign({
                email: session.metadata.customer_email,
                isSubscribed: true
            }, process.env.JWT_KEY, { expiresIn: '30d' });
            req.session = {
                jwt: token,
            };
            const emailToken = crypto_1.default.randomBytes(64).toString("hex");
            // find the user with the email and update the emailToken
            const user = await usersCollection.findOne({ email: session.metadata.customer_email });
            if (user) {
                await usersCollection.updateOne({ email: session.metadata.customer_email }, { $set: { emailToken } });
                (0, emailVerification_1.sendVerificationMail)({
                    email: session.metadata.customer_email,
                    emailToken: [emailToken],
                    baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : '',
                    userId: user._id.toString() // Add the user ID here
                });
            }
            // 
            res.status(200).json({ success: true });
        }
        else {
            res.status(400).json({ error: 'Payment was not successful' });
        }
    }
    catch (error) {
        console.error('Error handling successful checkout:', error);
        res.status(500).json({ error: 'Failed to process successful checkout' });
    }
};
exports.handleCheckoutSuccess = handleCheckoutSuccess;
/**
 * @description checks for web hooks coming from Stripe
 * @route POST /api/payments/webhook
 * @access public
*/
const stripeWebhooks = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    if (!req['rawBody'] || !process.env.WEB_HOOK_SECRET) {
        res.status(400).send('Invalid request: missing raw body');
        return;
    }
    try {
        event = stripe_1.stripeAPI.webhooks.constructEvent(req['rawBody'], sig, process.env.WEB_HOOK_SECRET);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
        else {
            // Handle or log the unexpected error type
            res.status(500).send('Internal server error');
        }
    }
    ;
    if (event?.type === 'checkout.session.completed') {
        const session = event.data.object;
        const ordersRepository = new orders_1.OrdersRepository();
        //SAVE TO THE DATA BASE AND SEND CONFIRMATION EMAIL.
        const name = session.customer_details?.name;
        const email = session.customer_details?.email;
        const state = session.shipping_details?.address?.state;
        const city = session.shipping_details?.address?.city;
        const address = session.shipping_details?.address?.line1 + ' ' + session.shipping_details?.address?.line2;
        const postalCode = session.shipping_details?.address?.postal_code;
        const orderInformation = {
            name,
            email,
            state,
            city,
            address,
            postalCode
        };
        // Save Order to DB
        const order = await ordersRepository.saveToDb(orderInformation);
        orderInformation.orderId = order.orderId;
        // Send Confirmation Email
        // await ordersRepository.sendOrderConfirmationEmail_(
        //   orderInformation
        // );
    }
    ;
};
exports.stripeWebhooks = stripeWebhooks;
//# sourceMappingURL=payments.js.map