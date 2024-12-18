import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { authenticationValidator } from "../middlewares/authentication-validator";
import {
  login,
  signup,
  signout,
  currentuser,
  verifyemail,
  uploadFile,
  saveNeighborhoodData,
  updateUserData,
  getAllNeighborhoods,
  updateNeighborhoodData,
  getNeighborhood,
  uploadBlogFiles, 
  newsLetterSignUp,
  getSingleNeighborhoodData,
  neighborhoodResponsesCount,
  saveUserEmail, 
  getUserByIdAndToken,
  updatePassword,
  resetPassword
} from "../controllers/auth";

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  }
}

const router = express.Router();

/**
* AUTHENTICATION ROUTES:
*/
router.post("/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  validateRequest,
  asyncHandler(login)
);
router.post("/signup", asyncHandler(signup));
router.post("/signout", asyncHandler(signout));
router.get("/currentuser", authenticationValidator, asyncHandler(currentuser));
router.get("/emailVerification/:emailtoken", asyncHandler(verifyemail));
router.put("/updateuserdata/:id", authenticationValidator, asyncHandler(updateUserData));
router.post("/newsletter/signup", asyncHandler(newsLetterSignUp));
router.post("/emailregistration", asyncHandler(saveUserEmail));
router.get("/verifyUser/:id", asyncHandler(getUserByIdAndToken));
router.put('/updatepassword/:id', asyncHandler(updatePassword));
router.post('/passwordreset/:userId', asyncHandler(resetPassword));

/**
 * NEIGHBORHOOD DATA ROUTES:
*/
router.get("/neighborhood/imageupload/:neighborhood/:randomUUID", uploadFile);
router.get("/blog/:randomUUID", uploadBlogFiles);
router.post("/neighborhood/savedata", authenticationValidator, saveNeighborhoodData);
router.put("/updateneighborhood/:id", authenticationValidator, updateNeighborhoodData)
router.get("/neighborhoods", getAllNeighborhoods);
router.get("/neighborhood/:neighborhoodid", getNeighborhood);
router.get("/neighborhoodData/:neighborhood", getSingleNeighborhoodData);
router.get("/neighborhoodDataCount", authenticationValidator, neighborhoodResponsesCount);


export { router as auth }