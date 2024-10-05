import Stripe from 'stripe';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { ObjectId, Db } from 'mongodb';


export class PaymentsRepository {

  private stripeAPI: Stripe;
  private domainUrl: string;



  constructor(stripeSecretKey: string, baseUrl: string) {
    this.stripeAPI = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    this.domainUrl = baseUrl.split(' ')[0]; // Assuming the splitting logic is still relevant.
    
  }

  public async createCheckoutSession(lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], customerEmail: string): Promise<{ sessionId: string } | { error: string }> {
    // Check if line items and email are provided
    if (!lineItems || !customerEmail) {
      throw new BadRequestError('Missing required session parameters');
    }

    try {
      const session = await this.stripeAPI.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        customer_email: customerEmail,
        success_url: `${this.domainUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.domainUrl}/canceled`,
        shipping_address_collection: { allowed_countries: ['GB', 'US'] }
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error(error);
      throw new BadRequestError('An error occurred, unable to create session');
    }
  };


}