"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhooks = exports.createCheckoutSession = void 0;
// import { BadRequestError } from "../errors/bad-request-error";
const stripe_1 = require("../services/stripe");
const payments_1 = require("../database/repositories/payments");
const orders_1 = require("../database/repositories/orders");
const paymentsRepository = new payments_1.PaymentsRepository(process.env.STRIPE_SECRET_KEY, process.env.BASE_URL);
/**
 * @description creates checkout session
 * @route POST /api/payments/create-checkout-session
 * @access public
*/
const createCheckoutSession = async (req, res) => {
    const { line_items, customer_email } = req.body;
    if (!line_items || !customer_email) {
        return res.status(400).json({ error: 'missing required session parameters' });
    }
    try {
        const result = await paymentsRepository.createCheckoutSession(line_items, customer_email);
        // Check if the result has a sessionId
        if ('sessionId' in result) {
            res.status(200).json({ sessionId: result.sessionId });
        }
        else {
            // If we don't have a sessionId, return the error
            res.status(400).json({ error: result.error });
        }
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'an error occurred, unable to create session' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
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
        console.log("orderererere", order);
        console.log("orderInformationre", orderInformation);
        // Send Confirmation Email
        await ordersRepository.sendOrderConfirmationEmail(orderInformation);
    }
    ;
};
exports.stripeWebhooks = stripeWebhooks;
//# sourceMappingURL=payments.js.map