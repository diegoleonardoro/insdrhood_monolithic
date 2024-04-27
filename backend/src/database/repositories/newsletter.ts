import { Db } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { sendNewsLetterEmail } from '../../services/emailVerification';
import sgMail from '@sendgrid/mail';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs
import { Document } from 'mongodb';


export class NewsletterRepository {

  private db: Promise<Db>;
  private collectionName = 'newsletter';

  constructor() {
    this.db = connectToDatabase();
  };

  private async fetchSubscribers() {

    const db = await this.db;
    const emailsCollection = db.collection(this.collectionName);
    const now = new Date();
    const query = {
      $or: [
        { lastSent: { $exists: false } },
        {
          $expr: {
            $gte: [
              { $subtract: [now, "$lastSent"] },
              { $multiply: [{ $toDecimal: "$frequency" }, 518400000] } // Ensure frequency is a number
            ]
          }
        }
      ]
    };

    const newslettersToSend = await emailsCollection.find(query).toArray();
    return newslettersToSend;
  };

  private async sendEmails(subscribers: any[]) {


    console.log("process.env.SENDGRID_API_KEY!", process.env.SENDGRID_API_KEY!)

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    if (subscribers.length === 0) {
      return { message: "No subscribers.", statusCode: 404 };
    }
    const msg = {
      from: { name: "Insider Hood", email: "admin@insiderhood.com" },
      personalizations: subscribers.map(subscriber => ({
        to: [{ email: subscriber.email }],
        dynamic_template_data: {
          name: subscriber.name,
        //   unsubscribeButton: `<a href="${process.env.BASE_URL?.split(" ")[0]}/newsletterpreferences?user_id=${subscriber.identifier}"
        //   style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px;">
        //   Click Here
        // </a>`
        }
      })),
      templateId: "d-beef468c69d64cfdbfac6b4e03546e08"
    };
    try {
      await sgMail.send(msg);
      const ids = subscribers.map(sub => sub._id);
      await this.updateLastSent(ids);
      return { message: "Newsletter Sent", statusCode: 200 };
    } catch (error) {
      console.error("Error sending email: ", error);
      return { message: "Failed to send newsletter", statusCode: 400 };
    }

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

  async sendNewsLetter(): Promise<{ message: string, statusCode: number }> {

    try {

      const subscribers = await this.fetchSubscribers();//data.frequency
      console.log('subscribersss', subscribers);
      // return ({ message: '', statusCode: 2 });
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

  async updateUsers(data: { identifier?: string, updates?: {} }): Promise<{ message: string, statusCode: number }> {
    const db = await this.db;
    const emailsCollection = db.collection(this.collectionName);

    if (!data.identifier) {
      const allUsersCursor = emailsCollection.find({});
      const allUsers = await allUsersCursor.toArray();

      for (const doc of allUsers) {
        const updateResult = await emailsCollection.updateOne(
          { _id: doc._id },
          { $set: { identifier: uuidv4() } }
        );
        console.log(updateResult);
      }
      return { message: `Updated documents with UUIDs`, statusCode: 200 };
    } else {
      // Update specific document by identifier
      const updateResult = await emailsCollection.updateOne(
        { identifier: data.identifier },
        { $set: data.updates }
      );

      if (updateResult.matchedCount === 0) {
        return { message: 'No document found with the provided identifier', statusCode: 200 };
      } else {
        return { message: 'Document updated successfully', statusCode: 200 };
      }
    }
  };


  async getUserInfo(data: { identifier: string }): Promise<{ user: Document, statusCode: number }> {
    const db = await this.db;
    const emailsCollection = db.collection(this.collectionName);
    const { identifier } = data;
    const existingUser = await emailsCollection.findOne({ identifier });
    if (!existingUser) {
      throw new BadRequestError("No user found");
    };
    return ({ user: existingUser, statusCode: 200 })
  }
}