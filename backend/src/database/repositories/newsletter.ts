import { Db } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { sendNewsLetterEmail } from '../../services/emailVerification'; 

export class NewsletterRepository {
  private db: Promise<Db>;
  private collectionName = 'newsletter';

  constructor() {
    this.db = connectToDatabase();
  }

  async subscribeToNewsletter(email: string): Promise<{ message: string }> {
    const db = await this.db;
    const emailsCollection = db.collection(this.collectionName);
    const existingEmail = await emailsCollection.findOne({ email });

    if (existingEmail) {
      throw new BadRequestError("Email in use");
    }

    const newEmailData = { email, subscribed: true };
    await emailsCollection.insertOne(newEmailData);

    sendNewsLetterEmail({
      email: email,
      baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
    });

    return { message: "Email subscribed" };
  }
}