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
  getNeighborhood
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
router.put("/updateuserdata/:id", updateUserData);


/**
 * NEIGHBORHOOD DATA ROUTES:
*/
router.get("/neighborhood/imageupload/:neighborhood/:randomUUID/:imagetype", uploadFile);
router.post("/neighborhood/savedata", authenticationValidator, saveNeighborhoodData);
router.put("/updateneighborhood/:id", updateNeighborhoodData)
router.get("/neighborhoods", getAllNeighborhoods);
router.get("/neighborhood/:neighborhoodid", getNeighborhood);



export { router as auth }