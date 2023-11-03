import { Request, Response } from "express";
import { User } from "../models/user";
import { Neighborhood } from "../models/neighborhood";
import { BadRequestError } from "../errors/bad-request-error";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: "us-east-1",
});



import { sendVerificationMail } from "../services/emailVerification";

/**
 * @description registers a new user
 * @route POST /api/signup
 * @access public
*/
export const signup = async (req: Request, res: Response) => {

  const { name, email, password, image, formsResponded, residentId, userImagesId } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email in use");
  };

  // capiralize name and create email token:
  const nameFirstLetterCapitalized = name.charAt(0).toUpperCase();
  const remainingName = name.slice(1);
  const nameCapitalized = nameFirstLetterCapitalized + remainingName;
  const emailToken = crypto.randomBytes(64).toString("hex");

  // save user in database:
  const user = await User.build({
    name: nameCapitalized,
    email,
    password: password ? password : '',
    image: image ? image : null,
    isVerified: false,
    emailToken,
    formsResponded: formsResponded,
    residentId: residentId ? residentId : null,
    passwordSet: password ? true : false,
    userImagesId
  });

  await user.save();

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      isVerified: user.isVerified,
      residentId: user.residentId
    },
    process.env.JWT_KEY!
  );

  // Store JWT on the session object created by cookieSession
  req.session = {
    jwt: userJwt,
  };

  sendVerificationMail({
    name: user.name,
    email: user.email,
    emailToken: user.emailToken,
    baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL : ''
  })

  // sendVerificationMail({ name: user.name, email: user.email, emailToken: user.emailToken }, baseUrlForEmailVerification);  
  res.status(201).send(user);
}

/**
 * @description logs users in
 * @route POST /api/signin
 * @access public 
 */
export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

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

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      image: existingUser.image,
      isVerified: existingUser.isVerified,
      residentId: existingUser.residentId
    },
    process.env.JWT_KEY!
  );

  // Store JWT on the session object created by cookieSession
  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(existingUser);//existingUser

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
 * @description confirms user's email
 * @route GET /api/emailVerification/:emailtoken
 * @access only accessible with the email verification link
 */
export const verifyemail = async (req: Request, res: Response) => {

  const emailtoken = req.params.emailtoken;

  // find the user with the email token:
  const user = await User.findOne({ emailToken: emailtoken });

  if (!user) {
    throw new BadRequestError("Invalid email token")
  }

  user.isVerified = true;

  user.emailToken = '';
  await user.save();

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      isVerified: user.isVerified,
      residentId: user.residentId
    },
    process.env.JWT_KEY!
  );

  // Store JWT on the session object created by cookieSession
  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(user);

}

/**
 * @description makes request to aws S3 to get signed url
 * @route GET /api/neighborhood/imageupload/:neighborhood/:randomUUID/:imagetype
 * @access public
 */
export const uploadFile = async (req: Request, res: Response) => {

  const { neighborhood, randomUUID, imageType } = req.params;

  const randomUUID_imageIdentifier = uuidv4();

  const key = `places/${req.currentUser ? req.currentUser!.id
    : randomUUID
    }/${neighborhood}/${randomUUID_imageIdentifier}.${imageType}`;


  s3.getSignedUrlPromise(
    "putObject",
    {
      Bucket: "populace",
      ContentType: imageType,
      Key: key,
    },
    (err: object, url: string) => {
      res.send({ key, url });
    }
  );



}

/**
 * @description save form data
 * @route POST /neighborhood/imageupload/:neighborhood/:randomUUID/:imagetype
 * @access public 
 */
export const saveNeighborhoodData = async (req: Request, res: Response) => {

  let user
  if (req.currentUser) {
    user = await User.findOne({ email: req.currentUser!.email });
  }

  const neighborhood = Neighborhood.build({
    ...req.body,
    user: user ? { id: user!.id, name: user!.name, email: user!.email } : undefined
  })

  await neighborhood.save();

  res.status(201).send( neighborhood );

}

/**
 * @description updates user data
 * @route PUT /api/updateuserdata/:id
 * @access private
 */
export const updateUserData = async (req: Request, res: Response) => {

  const { id } = req.params;
  const updates = req.body;

  console.log('upsss', updates);


  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

  console.log("updated user", user);
  res.status(200).send(user);
}