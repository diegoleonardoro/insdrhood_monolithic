import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { authenticationValidator } from "../middlewares/authentication-validator";
import { login, signup, signout, currentuser } from "../controllers/auth";

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  }
}

const router = express.Router();
router.post("/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  validateRequest,
  asyncHandler(login)
);

router.post("/signup", asyncHandler(signup));
router.post("/signout", asyncHandler(signout));// authenticationValidator,
router.get("/currentuser", authenticationValidator, asyncHandler(currentuser));//currentuser controller

router.put("/updateuser");// updateuser controller
router.put("/confirmemail");// confirmemail controller



export { router as auth }