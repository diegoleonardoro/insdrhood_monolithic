import { Request, Response } from "express";
import { BadRequestError } from "../errors/bad-request-error";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
const AWS = require("aws-sdk");
import { getDb } from "../index";
import { ObjectId } from 'mongodb';
import { sendVerificationMail } from "../services/emailVerification";
import { User } from "../models/user";
import { Neighborhood } from "../models/neighborhood";


interface updateQuery {
  $set?: any,
  $push?: any,
  $pull?: any
}


/**
 * @description registers a new user
 * @route POST /api/signup
 * @access public
*/
export const signup = async (req: Request, res: Response) => {

  const { name, email, password, image, formsResponded, neighborhoodId, userImagesId } = req.body;
  const db = await getDb();
  const users = db.collection("users");
  const existingUser = await users.findOne({ email });

  // for this erorr to be thrown, there has to be a saved user with email that came in the request body. 
  // If when a user does not send email ther email is saved as an empty string, then every time a new user without email is saved, this error will be shown. 

  if (existingUser) {
    throw new BadRequestError("Email in use");
  };

  // // capiralize name and create email token:
  const nameFirstLetterCapitalized = name.charAt(0).toUpperCase();
  const remainingName = name.slice(1);
  const nameCapitalized = nameFirstLetterCapitalized + remainingName;
  const emailToken = crypto.randomBytes(64).toString("hex");

  const hashedPassword = password ? await Password.toHash(password) : '';

  const user = {
    name: nameCapitalized,
    email: email === '' ? null : email,
    password: hashedPassword,
    image: image ? image : null,
    isVerified: false,
    emailToken: [emailToken],
    formsResponded: formsResponded,
    neighborhoodId: neighborhoodId ? neighborhoodId : null,
    passwordSet: password ? true : false,
    userImagesId
  };

  const newUser = await users.insertOne(user);

  const userInfo = {
    id: newUser.insertedId.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    isVerified: user.isVerified,
    neighborhoodId: user.neighborhoodId,
    userImagesId: user.userImagesId,
    passwordSet: user.passwordSet
  }

  // Generate JWT
  const userJwt = jwt.sign(
    userInfo,
    process.env.JWT_KEY!
  );

  // Store JWT on the session object created by cookieSession
  req.session = {
    jwt: userJwt,
  };

  // if there is not email present, then do not send email verification:
  if (user.email !== '' && user.email) {
    sendVerificationMail({
      name: user.name,
      email: user.email,
      emailToken: user.emailToken,
      baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
    });
  }

  // const insertedRecord = await users.findOne({ _id: newUser.insertedId });
  res.status(201).send(userInfo);

}


/**
 * @description logs users in
 * @route POST /api/signin
 * @access public 
 */
export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body;

  const db = await getDb();
  const users = db.collection("users");
  const existingUser = await users.findOne({ email });

  if (!existingUser) {
    throw new BadRequestError("Invalid credentials");
  }

  const passwordMatch = await Password.compare(
    existingUser?.password,
    password
  );

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
    passwordSet: existingUser.passwordSet
  }

  // Generate JWT
  const userJwt = jwt.sign(
    userInfo,
    process.env.JWT_KEY!
  );

  // Store JWT on the session object created by cookieSession
  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(userInfo);//existingUser

}

/**
 * @description checks if there is a logged in user and if so sends it back to the client
 * @route GET /api/currentuser
 * @access public 
 */
export const currentuser = async (req: Request, res: Response) => {
  res.send(req.currentUser || null);
}


/**
 * @description logs user out 
 * @route POST /api/signout
 * @access only accesible when user is authenticated
 */
export const signout = async (req: Request, res: Response) => {
  delete req.session?.jwt
  res.send({});
}

/**
 * @description updates user data
 * @route PUT /api/updateuserdata/:id
 * @access private
 */
export const updateUserData = async (req: Request, res: Response) => {

  const { id } = req.params;
  let updates = req.body;
  const db = await getDb();
  const users = db.collection("users");

  // if there is a "password" property in the updates object, then hash the password:
  if (updates.password) {
    updates.password = await Password.toHash(updates.password);
  }

  let existingUser;

  // check if updates has email property and if so create an emailtoken which will be icluded in the updates.
  if ("email" in updates) {

    const emailToken = crypto.randomBytes(64).toString("hex");

    // check if the email is alredy registered and if so, return an error:

    existingUser = await users.findOne({
      email: updates.email,
      _id: { $ne: new ObjectId(id) } // Add this line
    });

    updates.emailToken = [emailToken];
  }

  if (existingUser) {
    throw new BadRequestError("Email in use");
  }

  const user = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );


  const userInfo = {
    id: user?._id.toString(),
    email: user?.email,
    name: user?.name,
    image: user?.image,
    isVerified: user?.isVerified,
    neighborhoodId: user?.neighborhoodId,
    userImagesId: user?.userImagesId,
    passwordSet: user?.passwordSet
  }

  // Generate JWT
  const userJwt = jwt.sign(
    userInfo,
    process.env.JWT_KEY!
  );

  // Store JWT on the session object created by cookieSession
  req.session = {
    jwt: userJwt,
  };

  if (updates.emailToken && updates.email !== '' && updates.email) {
    sendVerificationMail({
      name: userInfo.name,
      email: userInfo.email,
      emailToken: updates.emailToken,
      baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
    });
  }

  res.status(200).send(user);

}



/**
 * @description confirms user's email
 * @route GET /api/emailVerification/:emailtoken
 * @access only accessible with the email verification link
 */
export const verifyemail = async (req: Request, res: Response) => {

  const emailtoken = req.params.emailtoken;
  const db = await getDb();
  const users = db.collection("users");

  // find the user with the email token:
  const user = await users.findOne({ emailToken: { $in: [emailtoken] } });

  if (!user) {
    throw new BadRequestError("Invalid email token")
  }

  const updatedUser = await users.findOneAndUpdate(
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
    passwordSet: user?.passwordSet
  }

  // Generate JWT
  const userJwt = jwt.sign(
    userInfo,
    process.env.JWT_KEY!
  );

  // Store JWT on the session object created by cookieSession
  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(userInfo);

}


/**
 * @description makes request to aws S3 to get signed url
 * @route GET /api/neighborhood/imageupload/:neighborhood/:randomUUID/:imagetype
 * @access public
 */
export const uploadFile = async (req: Request, res: Response) => {

  const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
    region: "us-east-1",
  });

  const { neighborhood, randomUUID, imageType } = req.params;
  const randomUUID_imageIdentifier = uuidv4();
  const key = `places/${req.currentUser ? req.currentUser!.id
    : randomUUID
    }/${neighborhood}/${randomUUID_imageIdentifier}.${imageType}`;

  s3.getSignedUrlPromise(
    "putObject",
    {
      Bucket: "insiderhood",
      ContentType: imageType,
      Key: key,
    },
    (err: object, url: string) => {
      res.send({ key, url });
    }
  );

}


/**
 * @description saves form data
 * @route POST /neighborhood/savedata
 * @access public 
 */
export const saveNeighborhoodData = async (req: Request, res: Response) => {

  const db = await getDb();
  const users = db.collection("users");

  let user
  if (req.currentUser) {
    user = await users.findOne({ email: req.currentUser!.email });
  };

  const neighborhoods = db.collection("neighborhoods");


  const newNeighborhood = await neighborhoods.insertOne({
    ...req.body,
    user: user ?
      { id: user!._id, name: user!.name, email: user!.email }
      :
      { id: '', name: '', email: '' }

  })


  res.status(201).send(newNeighborhood);
}

/**
 * @description updates neighborhood data
 * @route PUT /api/updateneighborhood/:id
 * @access public
*/
export const updateNeighborhoodData = async (req: Request, res: Response) => {

  const { id } = req.params;
  let updates = req.body;
  const db = await getDb();
  const neighborhoods = db.collection("neighborhoods");
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


  const neighborhood = await neighborhoods.findOneAndUpdate(
    { _id: new ObjectId(id) },
    updateQuery,
    { returnDocument: "after" }
  );


  // const neighborhood = await Neighborhood.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true });
  res.status(200).send(neighborhood);

}

/**
 * @description gets all neighbohoods data submitted from the form 
 * @route GET/api/neighborhoods
 * @access public 
 */
export const getAllNeighborhoods = async (req: Request, res: Response) => {

  // const allNeighborhoods = await Neighborhood.find({});
  const db = await getDb();
  const neighborhoodsCollection = db.collection("neighborhoods")
  const neighborhoods = await neighborhoodsCollection.find({}).toArray();
  res.status(200).send(neighborhoods);

}

/**
 * @description get a specific neighborhood
 * @route /api/neighborhood/:neighborhoodid
 * @access public 
 */
export const getNeighborhood = async (req: Request, res: Response) => {
  const { neighborhoodid } = req.params;
  const db = await getDb(); //
  const neighbohoods = db.collection("neighborhoods");
  const neighborhood = await neighbohoods.findOne({ _id: new ObjectId(neighborhoodid) })
  res.status(200).send(neighborhood);

}