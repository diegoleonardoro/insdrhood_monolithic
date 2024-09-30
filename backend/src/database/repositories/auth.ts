import { ObjectId, Db } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { Password } from '../../services/password';
import { sendVerificationMail } from '../../services/emailVerification';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  image?: string;
  isVerified?: boolean;
  neighborhoodId?: string;
  userImagesId?: string;
  passwordSet?: boolean;
  formsResponded?: string[];
}

interface LoginResult {
  userJwt: string;
  userInfo: {
    id: string;
    email: string;
    name: string;
    image?: string;
    isVerified?: boolean;
    neighborhoodId?: string;
    userImagesId?: string;
    passwordSet?: boolean;
    formsResponded?: string[];
  };
}

interface UserSignupInfo {
  name: string;
  email?: string;
  password?: string;
  image?: string;
  formsResponded?: string[];
  neighborhoodId?: string;
  userImagesId?: string;
}



export class AuthRepository {

  static verifyUser(emailtoken: string) {
    throw new Error("Method not implemented.");
  }
  static getUser(email: string): any {
    throw new Error("Method not implemented.");
  }

  private db: Promise<Db>;
  private collectionName = 'users';

  constructor() {
    this.db = connectToDatabase();
  }

  async getUserById(id: string): Promise<any> {
    const db = await this.db;
    const usersCollection = db.collection(this.collectionName);
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    return user;
  }
  async getUser(email: string): Promise<any> {
    const db = await this.db;
    const usersCollection = db.collection(this.collectionName);
    const user = await usersCollection.findOne({ email })
    return user;
  }

  async verifyUser(emailToken: string): Promise<{ userJwt: string, userInfo: object }> {

    const db = await this.db;
    const usersCollection = db.collection(this.collectionName);

    const user = await usersCollection.findOne({ emailToken: { $in: [emailToken] } });

    if (!user) {
      throw new BadRequestError("Invalid email token")
    }

    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          // emailToken: ''
        }
      },
      { returnDocument: 'after' }
    );

    const userInfo = {
      id: updatedUser?._id.toString(),
      email: updatedUser?.email,
      name: updatedUser?.name,
      image: updatedUser?.image,
      isVerified: updatedUser?.isVerified,
      neighborhoodId: updatedUser?.neighborhoodId,
      userImagesId: updatedUser?.userImagesId,
      passwordSet: user?.passwordSet,
      formsResponded: user?.formsResponded
    }

    // Generate JWT
    const userJwt = jwt.sign(
      userInfo,
      process.env.JWT_KEY!
    );

    // Store JWT on the session object created by cookieSession

    return { userJwt, userInfo };

  }

  async updateUserData(id: string, updates: any): Promise<{ userJwt: string, userInfo: UserInfo }> {

    const db = await this.db;
    const usersCollection = db.collection(this.collectionName);

    if (updates.password) {
      updates.password = await Password.toHash(updates.password);
    }

    if ('email' in updates) {
      const emailToken = crypto.randomBytes(64).toString('hex');
      const existingUser = await usersCollection.findOne({
        email: updates.email,
        _id: { $ne: new ObjectId(id) }
      });

      if (existingUser) {
        throw new BadRequestError('Email in use');
      }

      updates.emailToken = [emailToken];
    }

    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    const userInfo: UserInfo = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      image: updatedUser.image,
      isVerified: updatedUser.isVerified,
      neighborhoodId: updatedUser.neighborhoodId,
      userImagesId: updatedUser.userImagesId,
      passwordSet: updatedUser.passwordSet,
      formsResponded: updatedUser.formsResponded
    };

    const userJwt = jwt.sign(userInfo, process.env.JWT_KEY!);

    return { userJwt, userInfo };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const db = await this.db;
    const usersCollection = db.collection(this.collectionName);
    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordMatch = await Password.compare(existingUser.password, password);

    if (!passwordMatch) {
      throw new BadRequestError("Incorrect password");
    }

    const userInfo = {
      id: existingUser._id.toString(),
      email: existingUser.email,
      name: existingUser.name,
      image: existingUser.image,
      isVerified: existingUser.isVerified,
      neighborhoodId: existingUser.neighborhoodId,
      userImagesId: existingUser.userImagesId,
      passwordSet: existingUser.passwordSet,
      formsResponded: existingUser.formsResponded,
    };

    // Generate JWT
    const userJwt = jwt.sign(userInfo, process.env.JWT_KEY!);

    return { userJwt, userInfo };
  }

  async signup(userInfo: UserSignupInfo): Promise<{ userJwt: string, userInfo: object }> {

    const db = await this.db;
    const usersCollection = db.collection(this.collectionName);
    const existingUser = await usersCollection.findOne({ email: userInfo.email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    };

    const nameCapitalized = userInfo.name.charAt(0).toUpperCase() + userInfo.name.slice(1);
    const emailToken = crypto.randomBytes(64).toString("hex");
    const hashedPassword = userInfo.password ? await Password.toHash(userInfo.password) : '';

    const newUser = {
      ...userInfo,
      name: nameCapitalized,
      email: userInfo.email === '' ? null : userInfo.email,
      password: hashedPassword,
      image: userInfo.image ? userInfo.image : null,
      isVerified: false,
      emailToken: [emailToken],
      neighborhoodId: userInfo.neighborhoodId ? userInfo.neighborhoodId : null,
      passwordSet: !!userInfo.password,
      formsResponded: userInfo.formsResponded,
      userImagesId: userInfo.userImagesId
    };

    const insertResult = await usersCollection.insertOne(newUser);
    const userId = insertResult.insertedId;

    const userInfoForJwt = {
      id: userId.toString(),
      email: newUser.email,
      name: newUser.name,
      image: newUser.image,
      isVerified: newUser.isVerified,
      neighborhoodId: newUser.neighborhoodId,
      userImagesId: newUser.userImagesId,
      passwordSet: newUser.passwordSet
      // Include other necessary fields
    };

    const userJwt = jwt.sign(userInfoForJwt, process.env.JWT_KEY!);


    console.log("newUser.name", newUser.name)

    if (newUser.email) {
      sendVerificationMail({
        name: newUser.name,
        email: newUser.email,
        emailToken: [emailToken],
        baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
      });
    }

    return { userJwt, userInfo: userInfoForJwt };
  }

  async saveEmail(email: string): Promise<{ message: string }> {
    const db = await this.db;
    const usersCollection = db.collection(this.collectionName);

    if (!email) {
      throw new BadRequestError('Email is required');
    }

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email already exists');
    }

    const emailToken = crypto.randomBytes(64).toString('hex');

    const newUser = {
      email,
      isVerified: false,
      // emailToken: [emailToken],
      createdAt: new Date()
    };
    await usersCollection.insertOne(newUser);
    // Send verification email
    return { message: 'Email saved successfully' };
  }

}