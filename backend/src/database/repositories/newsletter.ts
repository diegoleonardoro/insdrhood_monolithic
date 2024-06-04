import { Db } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { sendNewsLetterEmail } from '../../services/emailVerification';
import sgMail from '@sendgrid/mail';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs
import { Document } from 'mongodb';
import { createClient, RedisClientType } from 'redis';
import { gunzip } from 'zlib';
import { promisify } from 'util';



export class NewsletterRepository {

  private db: Promise<Db>;
  private collectionName = 'newsletter';
  private cacheKey311Calls = "complaints_data";
  private redisClient: RedisClientType;


  constructor() {
    this.db = connectToDatabase();
    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    })
    this.redisClient.connect().then(() => {
      console.log('Successfully connected to Redis');
    })
      .catch(error => {
        console.error('Failed to connect to Redis:', error);
      });
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
      templateId: "d-a9c9d7ddcb51448e8c73e2e26f25b14d"
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

  async subscribeToNewsletter(data: { email: string, name?: string, newsletter: boolean, frequency?: string, zipCode?: string }): Promise<{ message: string }> {

    const db = await this.db;
    const { email, name = null, newsletter, zipCode, frequency = 'everyweek' } = data;
    const emailsCollection = db.collection(this.collectionName);
    const existingEmail = await emailsCollection.findOne({ email });

    if (existingEmail) {
      throw new BadRequestError("Email in use");
    };

    const newData = { email, name, newsletter, frequency, zipCode };
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
      return ({ message: '', statusCode: 2 });
      // return await this.sendEmails(subscribers);

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


  async geoBasedNewsLetter(): Promise<{ message: string, statusCode: number }> {
    try {
      const base64data = await this.redisClient.get('complaints_data');
      if (!base64data) {
        console.log('No data found.');
        return { message: 'No data found', statusCode: 404 };
      }
      // Decode from base64 then decompress
      const buffer = Buffer.from(base64data, 'base64');
      const decompressAsync = promisify(gunzip);
      const decompressedData = await decompressAsync(buffer);
      const data = JSON.parse(decompressedData.toString('utf-8'));


      console.log('Retrieved and processed data:', data);
      return { message: 'Data processed successfully', statusCode: 200 };

    } catch (error) {
      console.error('An error occurred:', error);
      return { message: 'Error during data retrieval and processing', statusCode: 500 };
    }
  }






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