import express, { NextFunction, Request, Response } from "express";
import { sendNewsLetter, sendNewsLetterReferralEmail, udpateNewsletterUsers, getuserInfo } from '../controllers/newsletter';
import { updateNeighborhoodData } from "../controllers/auth";

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  }
}

const router = express.Router();
router.post("/sendnewsletter", asyncHandler(sendNewsLetter));
router.post("/newsletterreferral", asyncHandler(sendNewsLetterReferralEmail));
router.put("/udpate", asyncHandler(udpateNewsletterUsers));
router.get("/getuserinfo/:identifier", asyncHandler(getuserInfo))

export { router as newsletter }