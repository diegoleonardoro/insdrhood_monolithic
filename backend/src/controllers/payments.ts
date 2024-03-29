import { Request, Response } from "express";
// import { BadRequestError } from "../errors/bad-request-error";
// import { stripeAPI } from "../services/stripe";
import { PaymentsRepository } from "../database/repositories/payments";

// import Stripe from 'stripe';


const paymentsRepository = new PaymentsRepository(process.env.STRIPE_SECRET_KEY!, process.env.BASE_URL!);

/**
 * @description registers a new user
 * @route POST /api/payments/create-checkout-session
 * @access public
*/

export const createCheckoutSession = async (req: Request, res: Response) => {

  const { line_items, customer_email } = req.body;

  if (!line_items || !customer_email) {
    return res.status(400).json({ error: 'missing required session parameters' });
  }

  try {
    const result = await paymentsRepository.createCheckoutSession(line_items, customer_email);

    // Check if the result has a sessionId
    if ('sessionId' in result) {
      // If we have a sessionId, return it
      res.status(200).json({ sessionId: result.sessionId });
    } else {
      // If we don't have a sessionId, return the error
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'an error occurred, unable to create session' });
  }

  // const stripeAPI = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const domainUrl = process.env.BASE_URL?.split(' ')[0];
  // const { line_items, customer_email } = req.body;
  // // check req body has line items and emai
  // if (!line_items || !customer_email) {
  //   return res.status(400).json({ error: 'missing required session parameters' });
  // };
  // let session;
  // try {
  //   session = await stripeAPI.checkout.sessions.create({
  //     payment_method_types: ['card'],
  //     mode: 'payment',
  //     line_items,
  //     customer_email,
  //     success_url: `${domainUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  //     cancel_url: `${domainUrl}/canceled`,
  //     shipping_address_collection: { allowed_countries: ['GB', 'US'] }
  //   });
  //   res.status(200).json({ sessionId: session.id, });
  // } catch (error) {
  //   console.log(error);
  //   res.status(400).json({ error: 'an error occured, unable to create session' });
  // }



}



