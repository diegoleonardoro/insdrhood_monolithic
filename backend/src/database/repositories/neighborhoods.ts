import { ObjectId, Db } from 'mongodb';
import { connectToDatabase } from '../index';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';


import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Password } from '../../services/password';
import { BadRequestError } from '../../errors/bad-request-error';
import { sendVerificationMail } from '../../services/emailVerification';


interface updateQuery {
  $set?: any,
  $push?: any,
  $pull?: any
}

interface UpdateData {
  neighborhoodImages?: any;
  removeImages?: any;
  nightLifeRecommendations?: any;
  recommendedFoodTypes?: any;
  [key: string]: any;
}

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}


export class NeighborhoodRepository {


  static saveFormData(body: any, user: any) {
    throw new Error("Method not implemented.");
  }

  private db: Promise<Db>;
  private collectionName = 'neighborhoods';
  s3: AWS.S3;

  constructor() {
    this.db = connectToDatabase();
    this.s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
      region: 'us-east-1',
    })
  }

  async getAll({ page = 1, pageSize = 10 }): Promise<{ neighborhoods: any[], total: number }> {

    const db = await this.db;
    const neighborhoodsCollection = db.collection(this.collectionName);
    const projection = { neighborhoodDescription: 1, user: 1, borough: 1, neighborhood: 1 };
    const skip = (page - 1) * pageSize;

    const total = await neighborhoodsCollection.countDocuments({});
    const neighborhoods = await neighborhoodsCollection
      .find({}, { projection })
      .sort({ neighborhood: 1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();
    return { neighborhoods, total };
  }

  async getOne(neighborhoodId: string): Promise<any> {
    const db = await this.db;
    const neighborhoodsCollection = db.collection(this.collectionName);
    const neighborhood = await neighborhoodsCollection.findOne({ _id: new ObjectId(neighborhoodId) });
    return neighborhood;
  }

  async updateNeighborhoodData(id: string, updates: UpdateData): Promise<any> {

    const db = await this.db;
    const neighborhoodsCollection = db.collection(this.collectionName);
    let updateQuery: updateQuery = {};

    //Handling updates for nested objects:
    if (!updates.neighborhoodImages && !updates.removeImages && !updates.nightLifeRecommendations && !updates.recommendedFoodTypes) {

      Object.keys(updates).forEach((key) => {
        if (typeof updates[key] === 'object' && updates[key] !== null) {

          // Iterate over nested object fields
          for (const nestedKey in updates[key]) {
            // Use dot notation for nested fields
            updateQuery.$set = updateQuery.$set || {};
            updateQuery.$set[`${key}.${nestedKey}`] = updates[key][nestedKey];
          }
          // Remove the nested object from updates after processing
          delete updates[key];
        }
      });
    }

    if (updates.removeImages) {
      updateQuery.$set = { neighborhoodImages: updates.removeImages };
      delete updates.removeImages
    }

    if (updates.neighborhoodImages) {
      // If updating neighborhoodImages, use $push to add images to the existing array
      updateQuery.$push = { neighborhoodImages: { $each: updates.neighborhoodImages } };
      delete updates.neighborhoodImages; // Remove the property after adding to $push
    }

    if (Object.keys(updates).length > 0) {
      // If there are other updates, use $set to update fields
      updateQuery.$set = { ...updateQuery.$set, ...updates };
    }
    const neighborhood = await neighborhoodsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updateQuery,
      { returnDocument: "after" }
    );

    return neighborhood
  }

  async saveFormData(formData: {}, user: UserData): Promise<any> {
    const db = await this.db;
    const neighborhoodsCollection = db.collection(this.collectionName);
    const newNeighborhood = await neighborhoodsCollection.insertOne({
      ...formData,
      user: user ?
        { id: user!._id, name: user!.name, email: user!.email }
        :
        { id: '', name: '', email: '' }
    });

    return newNeighborhood;
  }

  async generateUploadUrl(randomUUID: string): Promise<{ key: string; url: string }> {
    const randomUUID_imageIdentifier = uuidv4();
    const key = `blog/${randomUUID}/${randomUUID_imageIdentifier}`;

    // Using getSignedUrlPromise which returns a promise
    try {
      const url = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: 'insiderhood',
        Key: key,

      });
      return { key, url };
    } catch (err) {
      console.error('Error generating signed URL', err);
      throw err; // Rethrow or handle as needed
    }
  }


  async generateUploadUrlForForm(neighborhood: string, randomUUID: string, user: UserData | null): Promise<{ key: string; url: string }> {


    const randomUUID_imageIdentifier = uuidv4();
    const key = `places/${user ? user!.id
      : randomUUID
      }/${neighborhood}/${randomUUID_imageIdentifier}`;

    // Using getSignedUrlPromise which returns a promise
    try {
      const url = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: 'insiderhood',
        Key: key,

      });
      return { key, url };
    } catch (err) {
      console.error('Error generating signed URL', err);
      throw err; // Rethrow or handle as needed
    }


  }


  async verifyemail(emailtoken:string): Promise<{}> {

    const db = await this.db;
    const users = db.collection("users");

    const user = await users.findOne({ emailToken: { $in: [emailtoken] } });



    return {}
  }



}

