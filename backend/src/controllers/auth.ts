import { Request, Response } from "express";
import { sendVerificationMail, sendNewsLetterEmail } from "../services/emailVerification";
import { NeighborhoodRepository } from "../database/repositories/neighborhoods";
import { AuthRepository } from "../database/repositories/auth";
import { NewsletterRepository } from "../database/repositories/newsletter";
import { ObjectId } from 'mongodb';



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
  const authRepository = new AuthRepository();

  const { userJwt, userInfo } = await authRepository.signup(req.body)

  req.session = {
    jwt: userJwt,
  };
  res.status(201).send(userInfo);
}

/**
 * @description registers a new email to the newsletter
 * @route POST /api/newsletter/signup
 * @access public
*/
export const newsLetterSignUp = async (req: Request, res: Response) => {
  const newsletterRepository = new NewsletterRepository();
  const result = await newsletterRepository.subscribeToNewsletter(req.body)
  res.status(201).send(result);
};

/**
 * @description logs users in
 * @route POST /api/signin
 * @access public 
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const authRepository = new AuthRepository();
  const { userJwt, userInfo } = await authRepository.login(email, password)
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
  const authRepository = new AuthRepository();
  const { userJwt, userInfo } = await authRepository.updateUserData(id, updates);
  //  Store JWT on the session object created by cookieSession
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
  res.status(200).send(userInfo);
}


/**
 * @description confirms user's email
 * @route GET /api/emailVerification/:emailtoken
 * @access only accessible with the email verification link
 */
export const verifyemail = async (req: Request, res: Response) => {
  const emailtoken = req.params.emailtoken;
  const authRepository = new AuthRepository();
  const { userJwt, userInfo } = await authRepository.verifyUser(emailtoken);
  req.session = {
    jwt: userJwt,
  };
  res.status(200).send(userInfo);
}

/**
 * @description makes request to aws S3 to get signed url
 * @route GET /api/neighborhood/imageupload/:neighborhood/:randomUUID
 * @access public
 */
export const uploadFile = async (req: Request, res: Response) => {

  const user = req.currentUser ? req.currentUser : null;
  const neighborhoodRepository = new NeighborhoodRepository();
  const { neighborhood, randomUUID } = req.params;
  const signedKeyUrl = await neighborhoodRepository.generateUploadUrlForForm(neighborhood, randomUUID, user);
  res.send(signedKeyUrl);

}

/**
 * @description makes request to aws S3 to get signed url for blog images
 * @route GET /api/blog/:randomUUID
 * @access public
 */

export const uploadBlogFiles = async (req: Request, res: Response) => {
  const neighborhoodRepository = new NeighborhoodRepository();
  const { randomUUID } = req.params;
  const signedKeyUrl = await neighborhoodRepository.generateUploadUrl(randomUUID)
  res.send(signedKeyUrl);
}

/**
 * @description saves form data
 * @route POST /neighborhood/savedata
 * @access public 
 */
export const saveNeighborhoodData = async (req: Request, res: Response) => {
  let user;
  if (req.currentUser) {
    user = await AuthRepository.getUser(req.currentUser!.email)
  };
  const neighborhoodRepository = new NeighborhoodRepository();
  const newNeighborhood = await neighborhoodRepository.saveFormData(req.body, user)
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
  const neighborhoodRepository = new NeighborhoodRepository();
  const neighborhood = await neighborhoodRepository.updateNeighborhoodData(id, updates)
  res.status(200).send(neighborhood);
}





/**
 * @description gets all neighbohoods data submitted from the form 
 * @route GET/api/neighborhoods
 * @access public 
 */
export const getAllNeighborhoods = async (req: Request, res: Response) => {
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const page = parseInt(req.query.page as string, 10) || 1;

  try {
    const neighborhoodRepository = new NeighborhoodRepository();
    const { neighborhoods } = await neighborhoodRepository.getAll({ page, pageSize });
    res.status(200).json({ neighborhoods });
  } catch (error) {
    console.error('Failed to fetch neighborhoods:', error);
    res.status(500).json({ message: 'Failed to fetch neighborhoods' });
  }

}




/**
 * @description gets a specific neighborhood 
 * @route GET/api/neighborhoods
 * @access public 
*/
export const getSingleNeighborhoodData = async (req: Request, res: Response) => {

  const { neighborhood } = req.params;

  try {
    const neighborhoodRepository = new NeighborhoodRepository();
    const neighborhoodCollections = await neighborhoodRepository.getNeighbohoodData(neighborhood)
    res.status(200).send(neighborhoodCollections);
  } catch (error) {
    console.error('Failed to fetch neighborhoods:', error);
    res.status(500).json({ message: 'Failed to fetch neighborhoods' });
  }

}

/**
 * @description get a specific neighborhood
 * @route /api/neighborhood/:neighborhoodid
 * @access public 
 */
export const getNeighborhood = async (req: Request, res: Response) => {
  const neighborhoodRepository = new NeighborhoodRepository();
  const neighborhood = await neighborhoodRepository.getOne(req.params.neighborhoodid);
  res.status(200).send(neighborhood);
}

/**
 * @description get a count 
 * @route /api/neighborhood/:neighborhoodid
 * @access public 
 */
export const neighborhoodResponsesCount = async (req: Request, res:Response)=>{
  const neighborhoodRepository = new NeighborhoodRepository();
  const nhoodResponsesCount = await neighborhoodRepository.neighborhoodResponsesCount()
  res.status(200).send(nhoodResponsesCount);
}



export const saveUserEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
    const authRepository = new AuthRepository();
    const result = await authRepository.saveEmail(email);
    res.status(201).json(result);

};