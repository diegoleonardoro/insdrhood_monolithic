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

