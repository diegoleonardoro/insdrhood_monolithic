import { Db } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { sendNewsLetterEmail } from '../../services/emailVerification';
import sgMail from '@sendgrid/mail';


export class NewsletterRepository {
  private db: Promise<Db>;
  private collectionName = 'newsletter';

  constructor() {
    this.db = connectToDatabase();
  }

  async subscribeToNewsletter(data: { email: string, name?: string, newsletter: boolean, frequency?: string }): Promise<{ message: string }> {

    const db = await this.db;
    const { email, name = null, newsletter, frequency = 'everyweek' } = data;
    const emailsCollection = db.collection(this.collectionName);
    const existingEmail = await emailsCollection.findOne({ email });

    if (existingEmail) {
      throw new BadRequestError("Email in use");
    };

    const newData = { email, name, newsletter, frequency };
    await emailsCollection.insertOne(newData);

    sendNewsLetterEmail({
      email: email,
      baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
    });
    return { message: "Email subscribed" };

  }


  async sendNewsLetter(data: { frequency: string, }): Promise<{ message: string, statusCode: number }> {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    const db = await this.db;
    const { frequency } = data;
    const emailsCollection = db.collection(this.collectionName);
    try {
      const subscribersDocuments = await emailsCollection.find(
        { frequency: frequency },
        { projection: { email: 1, _id: 0 } }
      ).toArray();

      // Extract the email addresses from the documents
      const subscribers = subscribersDocuments.map(doc => doc.email);

      if (subscribers.length === 0) {
        return { message: `No subscribers.`, statusCode: 500 }
      } else {

        const msg = {
          to: subscribers, // Ensure this is an array of email strings
          from: {
            name: "Insider Hood",
            email: "admin@insiderhood.com"
          },
          // dynamic_template_data: {
          //   name: "Diego"
          // },
          templateId: "d-007c132db5d3481996d2e3720cb9fdce"
        }
        await sgMail.send(msg);
        return { message: "Newsletter Sent", statusCode: 200 };
      };

    } catch (error) {
      console.error("Error retrieving subscribers:", error); // Catch and log any errors during the query
      return { message: `Failed to send newsletter.`, statusCode: 500 }
    }
  };


  async sendReferralEmail(data: { email: string, templateId: string }): Promise<{ message: string, statusCode:number }> {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    const { email, templateId } = data;
    const db = await this.db;
    const emailsCollection = db.collection(this.collectionName);
    const existingEmail = await emailsCollection.findOne({ email });
    if (existingEmail) {
      throw new BadRequestError("Email in use");
    };

    try {
      const msg = {
        to: email,
        from: {
          name: "Insider Hood",
          email: "admin@insiderhood.com"
        },
        templateId: templateId
      };
      await sgMail.send(msg);
      return { message: "Newsletter Sent", statusCode:200 };

    } catch (error) {
      console.error("Error retrieving subscribers:", error); // Catch and log any errors during the query
      return { message: `Failed to send newsletter.`, statusCode: 500}
    }

  }





}