import express, { Request, Response } from 'express';
import cookieSession from "cookie-session";
import { json } from "body-parser";
import cors from "cors";
import { errorHandler } from './middlewares/error-handler';
import dotenv from "dotenv";
import { auth } from "./routes/auth";
import { payments } from "./routes/payments";
import { blog } from "./routes/blog";
import { newsletter } from "./routes/newsletter";
import { promotions } from "./routes/promotions"
import path from 'path';
import { NeighborhoodRepository } from './database/repositories/neighborhoods';
import { BlogRepository } from './database/repositories/blog';
import {chat} from "./routes/chat"
import { connectToDatabase } from "./database/index"
import { ReturnDocument } from 'mongodb';
import jwt from "jsonwebtoken";
import { sendPdfDownloadEmail } from "./services/emailVerification";


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(__dirname, '..', dotenvPath);
dotenv.config({ path: envPath });

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }  
}


const neighborhoodRepo = new NeighborhoodRepository();
neighborhoodRepo.createIndexes();
const blogRepo = new BlogRepository();
blogRepo.createIndexes();

const app = express();
const PORT = process.env.PORT || 5000;

// Move this webhook route before any middleware
app.post('/insiderhood/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('Received webhook request');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Webhook verified');
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Handle the event
  switch (event.type) {

    case 'checkout.session.completed':
      const session = event.data.object;
      const userEmail = session.customer_details.email;
      console.log('User email:', userEmail);
      console.log('Checkout completed:', session);

      try {
        // Assuming the PDF file name is stored in the session metadata
        const pdfFileName = session.metadata?.pdfFileName || 'https://insiderhood.s3.amazonaws.com/brochures/WestVillageSelfGuidedTour.pdf';
        
        await sendPdfDownloadEmail(userEmail, pdfFileName);
        console.log('PDF download email sent successfully');
      } catch (error) {
        console.error('Error sending PDF download email:', error);
      }
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
      const customerId = subscription.customer
      try {
        const customer = await stripe.customers.retrieve(customerId);
        const userEmail = customer.email;
        const subscriptionId = customer.id;
        const name = customer.name;

        const db = await connectToDatabase();
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
        const options = { upsert: true, returnDocument: ReturnDocument.AFTER };
        // update the user document:
        await usersCollection.findOneAndUpdate(filter, update, options);

      } catch (error) {
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

app.use(cors({
  origin: process.env.BASE_URL?.split(" "), // React client's URL
  credentials: true,
}));

app.use(json({
  verify: (req: Request, res: Response, buffer: Buffer, encoding: string) => {
    // Store the raw body buffer
    if (buffer && buffer.length) {
      req.rawBody = buffer;
    }
  }
}));

app.set("trust proxy", true);

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: process.env.NODE_ENV === "production",
    // maxAge: 24 * 60 * 60 * 1000,
  })
);


app.use("/api/chat", chat)
app.use("/api/blog", blog);
app.use("/api/payments", payments);
app.use("/api/newsletter", newsletter)
app.use("/api/promotions", promotions)
app.use("/api", auth);

app.use(errorHandler);

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Holaaaa youuuu! :)",
  })
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

