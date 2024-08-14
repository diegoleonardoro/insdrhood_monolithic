import { Db } from 'mongodb';
import { connectToDatabase } from '../index';

export class PromotionsRepository {

  private db: Promise<Db>;
  private collectionName = 'promotions';

  constructor() {
    this.db = connectToDatabase();
  }

  async addNewRecords(promotions: object[]): Promise<{ insertedData: object[] }> {
    const db = await this.db;
    const promotionsCollection = db.collection(this.collectionName);
    const insertResults = await promotionsCollection.insertMany(promotions);

    const insertedPromotions = promotions.map((promotion, index) => ({
      ...promotion,
      _id: insertResults.insertedIds[index],
    }));

    return { insertedData: insertedPromotions };
  }
}