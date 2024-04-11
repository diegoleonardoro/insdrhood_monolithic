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

  async subscribeToNewsletter(data: {email:string, name?:string, newsletter:boolean, frequency?:string}): Promise<{ message: string }> {

    const db = await this.db;
    const { email, name = null, newsletter, frequency ='everyweek'}= data;
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
}