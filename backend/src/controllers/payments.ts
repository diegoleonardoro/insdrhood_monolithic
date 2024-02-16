import { Request, Response } from "express";
import { BadRequestError } from "../errors/bad-request-error";
// import { stripeAPI } from "../services/stripe";

import Stripe from 'stripe';

// export const stripeAPI = new Stripe(process.env.STRIPE_SECRET_KEY!);

// console.log('process.env.STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY)

/**
 * @description registers a new user
 * @route POST /api/payments/create-payment-intent
 * @access public
*/

export const createCheckoutSession = async (req: Request, res: Response)=>{

  console.log("reqbody", req.body)

  const stripeAPI = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const domainUrl = process.env.BASE_URL;

  const { line_items, customer_email } = req.body;

  // check req body has line items and emai
  if (!line_items || !customer_email) {
    return res.status(400).json({ error: 'missing required session parameters' });
  };

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

    console.log("sessssion", session)
    res.status(200).json({ sessionId: session.id, });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: 'an error occured, unable to create session' });
  }

}



