import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";

const router = express.Router();

router.post("/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  validateRequest
); //login controller


router.post("/signup");//signup controller
router.post("/signout"); //signout controller
router.get("/currentuser");//currentuser controller
router.put("/updateuser");// updateuser controller
router.put("/confirmemail");// confirmemail controller



export { router as auth }