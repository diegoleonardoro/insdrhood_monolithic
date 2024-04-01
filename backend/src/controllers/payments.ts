import { Request, Response } from "express";
// import { BadRequestError } from "../errors/bad-request-error";
import { stripeAPI } from "../services/stripe";
import { PaymentsRepository } from "../database/repositories/payments";
import { OrdersRepository } from "../database/repositories/orders";
import { ObjectId } from 'mongodb'


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

  const { line_items, customer_email } = req.body;

  if (!line_items || !customer_email) {
    return res.status(400).json({ error: 'missing required session parameters' });
  }
  try {
    const result = await paymentsRepository.createCheckoutSession(line_items, customer_email);

    // Check if the result has a sessionId
    if ('sessionId' in result) {
      res.status(200).json({ sessionId: result.sessionId });
    } else {
      // If we don't have a sessionId, return the error
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'an error occurred, unable to create session' });
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
    await ordersRepository.sendOrderConfirmationEmail(
      orderInformation
    );



  };
}




