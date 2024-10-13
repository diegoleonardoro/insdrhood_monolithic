"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const error_handler_1 = require("./middlewares/error-handler");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const payments_1 = require("./routes/payments");
const blog_1 = require("./routes/blog");
const newsletter_1 = require("./routes/newsletter");
const promotions_1 = require("./routes/promotions");
const path_1 = __importDefault(require("path"));
const neighborhoods_1 = require("./database/repositories/neighborhoods");
const blog_2 = require("./database/repositories/blog");
const chat_1 = require("./routes/chat");
const index_1 = require("./database/index");
const mongodb_1 = require("mongodb");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path_1.default.resolve(__dirname, '..', dotenvPath);
dotenv_1.default.config({ path: envPath });
const neighborhoodRepo = new neighborhoods_1.NeighborhoodRepository();
neighborhoodRepo.createIndexes();
const blogRepo = new blog_2.BlogRepository();
blogRepo.createIndexes();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Move this webhook route before any middleware
app.post('/insiderhood/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    console.log('Received webhook request');
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('Webhook verified');
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err}`);
    }
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userEmail = session.customer_details.email;
            break;
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle successful payment
            console.log('Payment succeeded:', paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const failedPaymentIntent = event.data.object;
            // Handle failed payment
            console.log('Payment failed:', failedPaymentIntent);
            break;
        case 'customer.subscription.created':
            const subscription = event.data.object;
            const customerId = subscription.customer;
            try {
                const customer = await stripe.customers.retrieve(customerId);
                const userEmail = customer.email;
                const subscriptionId = customer.id;
                const name = customer.name;
                const db = await (0, index_1.connectToDatabase)();
                const usersCollection = db.collection('users');
                const filter = { email: userEmail };
                const update = {
                    $set: {
                        name: name,
                        subscriptionId: subscriptionId,
                        subscriptionStatus: subscription.status,
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        createdAt: new Date()
                    }
                };
                const options = { upsert: true, returnDocument: mongodb_1.ReturnDocument.AFTER };
                // update the user document:
                await usersCollection.findOneAndUpdate(filter, update, options);
            }
            catch (error) {
                console.error('Error handling subscription creation:', error);
            }
            break;
        case 'customer.subscription.updated':
            console.log('Subscription updated:', event.data.object);
            // Handle subscription update
            break;
        case 'customer.subscription.deleted':
            console.log('Subscription deleted:', event.data.object);
            // Handle subscription deletion
            break;
        // ... handle other events
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
});
app.use((0, cors_1.default)({
    origin: process.env.BASE_URL?.split(" "), // React client's URL
    credentials: true,
}));
app.use((0, body_parser_1.json)({
    verify: (req, res, buffer, encoding) => {
        // Store the raw body buffer
        if (buffer && buffer.length) {
            req.rawBody = buffer;
        }
    }
}));
app.set("trust proxy", true);
app.use((0, cookie_session_1.default)({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: process.env.NODE_ENV === "production",
    // maxAge: 24 * 60 * 60 * 1000,
}));
app.use("/api/chat", chat_1.chat);
app.use("/api/blog", blog_1.blog);
app.use("/api/payments", payments_1.payments);
app.use("/api/newsletter", newsletter_1.newsletter);
app.use("/api/promotions", promotions_1.promotions);
app.use("/api", auth_1.auth);
app.use(error_handler_1.errorHandler);
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Holaaaa youuuu! :)",
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map