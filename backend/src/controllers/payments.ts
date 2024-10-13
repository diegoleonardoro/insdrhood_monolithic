import { Request, Response } from "express";
// import { BadRequestError } from "../errors/bad-request-error";
import { stripeAPI } from "../services/stripe";
import { PaymentsRepository } from "../database/repositories/payments";
import { OrdersRepository } from "../database/repositories/orders";
import { ObjectId } from 'mongodb'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { connectToDatabase } from '../database/index';
import { sendVerificationMail } from '../services/emailVerification';


const paymentsRepository = new PaymentsRepository(process.env.STRIPE_SECRET_KEY!, process.env.BASE_URL!);

type OrderInformation = {
  name: string;
  email: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  orderId?: ObjectId; // Make orderId optional
};


/**
 * @description creates checkout session
 * @route POST /api/payments/create-checkout-session
 * @access public
*/
export const createCheckoutSession = async (req: Request, res: Response) => {
  
  const { customer_email, price_id } = req.body;
  const baseUrl = (process.env.BASE_URL || '').split(' ')
    .find(url => {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    });

  if (!baseUrl) {
    return res.status(500).json({ error: 'Invalid BASE_URL configuration' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
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

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }


}


/**
 * @description confirms the success of the checkout
 * @route GET /api/payments/handle-checkout-success
 * @access public
*/

export const handleCheckoutSuccess = async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  const db = await connectToDatabase();
  const usersCollection = db.collection('users');

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {

   
      const token = jwt.sign(
        {
          email: session.metadata.customer_email,
          isSubscribed: true
        },
        process.env.JWT_KEY!,
        { expiresIn: '30d' }
      );

      req.session = {
        jwt: token,
      };

      const emailToken = crypto.randomBytes(64).toString("hex");

      // find the user with the email and update the emailToken
      const user = await usersCollection.findOne({ email: session.metadata.customer_email });
      if (user) {
        await usersCollection.updateOne({ email: session.metadata.customer_email }, { $set: { emailToken } });

        sendVerificationMail({
          email: session.metadata.customer_email,
          emailToken: [emailToken],
          baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : '',
          userId: user._id.toString() // Add the user ID here
        });

      }

      // 
      res.status(200).json({ success: true })
    } else {
      res.status(400).json({ error: 'Payment was not successful' });
    }
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    res.status(500).json({ error: 'Failed to process successful checkout' });
  }
}






/**
 * @description checks for web hooks coming from Stripe
 * @route POST /api/payments/webhook
 * @access public
*/
export const stripeWebhooks = async (req: Request, res: Response) => {

  const sig = req.headers['stripe-signature'] as string;

  let event;
  if (!req['rawBody'] || !process.env.WEB_HOOK_SECRET) {
    res.status(400).send('Invalid request: missing raw body');
    return;
  }

  try {
    event = stripeAPI.webhooks.constructEvent(
      req['rawBody'], sig, process.env.WEB_HOOK_SECRET
    );
  } catch (error) {

    if (error instanceof Error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    } else {
      // Handle or log the unexpected error type
      res.status(500).send('Internal server error');
    }
  };

  if (event?.type === 'checkout.session.completed') {
    const session = event.data.object;  
    const ordersRepository = new OrdersRepository();

    //SAVE TO THE DATA BASE AND SEND CONFIRMATION EMAIL.
    const name = session.customer_details?.name as string;
    const email = session.customer_details?.email as string;
    const state = session.shipping_details?.address?.state as string;
    const city = session.shipping_details?.address?.city as string;
    const address = session.shipping_details?.address?.line1 + ' ' + session.shipping_details?.address?.line2
    const postalCode = session.shipping_details?.address?.postal_code as string;

    const orderInformation: OrderInformation = {
      name,
      email,
      state,
      city,
      address,
      postalCode
    }

    // Save Order to DB
    const order = await ordersRepository.saveToDb(orderInformation);
    orderInformation.orderId = order.orderId;

    // Send Confirmation Email
    // await ordersRepository.sendOrderConfirmationEmail_(
    //   orderInformation
    // );

  };
}




