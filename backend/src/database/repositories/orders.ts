import { ObjectId, Db, Document } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { sendOrderConfirmationEmail } from '../../services/emailVerification';


interface OrderInfo {
  name: string;
  email: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  orderId?: ObjectId;
}

export class OrdersRepository {

  private db: Promise<Db>;
  private collectionName = 'orders';

  constructor() {
    this.db = connectToDatabase();
  };


  async saveToDb(orderInfo: OrderInfo): Promise<{ orderId: ObjectId }> {
    const db = await this.db;
    const ordersCollection = db.collection(this.collectionName);
    const newOrder = await ordersCollection.insertOne(orderInfo)
    const orderId = newOrder.insertedId
    return { orderId }
  }

  async sendOrderConfirmationEmail_(orderInfo: OrderInfo): Promise<void> {
    console.log('orderInfo from sendConfirmation email ', orderInfo)
    sendOrderConfirmationEmail(orderInfo)
  }



}