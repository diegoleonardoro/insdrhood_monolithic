import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

// Create the user payload interface:
interface UserPayload {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
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
    //---------------------------------------
    // if (payload.isVerified === false) {
    //   const loggedUser = await User.findOne({ email: payload.email });
    //   if (loggedUser?.isVerified === true) {
    //     payload.isVerified = true;
    //   }
    // }
    //---------------------------------------
    req.currentUser = payload;

  } catch (err) { }

  next();
};