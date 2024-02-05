import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../index"
import { User } from "../models/user";

// Create the user payload interface:
interface UserPayload {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  passwordSet: boolean;
  neighborhoodId: [];
}

// We need to add "currentUser" as a new property of the Request object:
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

// Add the "currentUser" property to the request body if there is a currently logged in user:
export const authenticationValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;


    const db = await getDb();
    const users = db.collection("users");
    const existingUser = await users.findOne({ _id: new ObjectId(payload.id) });

    const equal = compareKeyValuePairs(payload, existingUser)

    if (!equal) {
      const userInfo = {
        id: existingUser?._id.toString(),
        email: existingUser?.email,
        name: existingUser?.name,
        image: existingUser?.image,
        isVerified: existingUser?.isVerified,
        neighborhoodId: existingUser?.neighborhoodId,
        userImagesId: existingUser?.userImagesId,
        passwordSet: existingUser?.passwordSet,

      };
      // Generate JWT
      const userJwt = jwt.sign(
        userInfo,
        process.env.JWT_KEY!
      );

      // Store JWT on the session object created by cookieSession
      req.session = {
        jwt: userJwt,
      };

      if (existingUser) {
        req.currentUser = {
          id: existingUser?._id.toString(),
          name: userInfo.name,
          email: userInfo.email,
          isVerified: userInfo.isVerified,
          passwordSet: existingUser?.passwordSet,
          neighborhoodId: existingUser?.neighborhoodId,
        };
      }

    } else {
      req.currentUser = payload;
    }

  } catch (err) { }

  next();
};



function compareKeyValuePairs(payloadd: any, currentUser: any) {
  // Assuming dddd might use '_id' instead of 'id' for comparison
  const ddddComparable = { ...currentUser, id: currentUser._id ? currentUser._id.toString() : currentUser.id };

  // Directly compare key-value pairs
  for (let key in payloadd) {
    // Convert arrays to string for comparison to simplify array equality check
    let payloaddValue = Array.isArray(payloadd[key]) ? payloadd[key].toString() : payloadd[key];
    let ddddValue = Array.isArray(ddddComparable[key]) ? ddddComparable[key].toString() : ddddComparable[key];

    if (payloaddValue !== ddddValue) {
      console.log(`Values differ for key ${key}.`);
      return false;
    }

  }

  // If no differences were found
  return true;
}