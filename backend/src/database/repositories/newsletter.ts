import { Db } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { sendNewsLetterEmail } from '../../services/emailVerification';
import sgMail from '@sendgrid/mail';
import { ObjectId } from 'mongodb';


export class NewsletterRepository {

  private db: Promise<Db>;
  private collectionName = 'newsletter';

  constructor() {
    this.db = connectToDatabase();
  };


  private async fetchSubscribers(frequency: string) {
    const db = await this.db;
    const emailsCollection = db.collection(this.collectionName);
    const now = Date.now();

    if (frequency === 'allofthem') {
      return emailsCollection.find(
        {},
        { projection: { email: 1, name: 1, frequency: 1, _id: 0 } } // also return the unique identifier 
      ).toArray();
    } else {

      const desiredFrequencyInWeeks = parseInt(frequency);
      const desiredFrequencyInMs = desiredFrequencyInWeeks * 7 * 24 * 60 * 60 * 1000;
      return emailsCollection.find({
        frequency: frequency,
        // Check if lastSent is either missing or greater than or equal to desired frequency
        $or: [
          { lastSent: { $exists: false } },
          { $expr: { $gte: [{ $subtract: [now, '$lastSent'] }, desiredFrequencyInMs] } } 
        ]
      }, { projection: { email: 1, name: 1, frequency: 1, _id: 0 } }).toArray();
    };
  };


  private async sendEmails(subscribers: any[]) {
    if (subscribers.length === 0) {
      return { message: "No subscribers.", statusCode: 404 };
    }

    const msg = {
      from: { name: "Insider Hood", email: "admin@insiderhood.com" },
      personalizations: subscribers.map(subscriber => ({
        to: [{ email: subscriber.email }],
        dynamic_template_data: { name: subscriber.name }
        // add unique identifier for user which will be used to give the user the option to unsubscribe or change the frequency they receive emails
      })),
      templateId: "d-007c132db5d3481996d2e3720cb9fdce"
    };

    await sgMail.send(msg);
    const ids = subscribers.map(sub => sub._id);
    await this.updateLastSent(ids);
    return { message: "Newsletter Sent", statusCode: 200 };

  }

  private async updateLastSent(ids: string[]) {
    const db = await this.db;
    const emailsCollection = db.collection(this.collectionName);
    // Convert string array to ObjectId array
    const objectIds = ids.map(id => new ObjectId(id));
    await emailsCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { lastSent: new Date() } }
    );
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

  };

  async sendNewsLetter(data: { frequency: string }): Promise<{ message: string, statusCode: number }> {

    try {
      const subscribers = await this.fetchSubscribers(data.frequency);      
      return await this.sendEmails(subscribers);
    } catch (error) {
      console.error("Error processing newsletter:", error);
      return { message: "Failed to send newsletter.", statusCode: 500 };
    }
  
  };



  async sendReferralEmail(data: { email: string, templateId: string }): Promise<{ message: string, statusCode: number }> {

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
      return { message: "Newsletter Sent", statusCode: 200 };

    } catch (error) {
      console.error("Error retrieving subscribers:", error); // Catch and log any errors during the query
      return { message: `Failed to send newsletter.`, statusCode: 500 }
    }

  }




}