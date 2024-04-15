import express, { NextFunction, Request, Response } from "express";
import { sendNewsLetter, sendNewsLetterReferralEmail } from '../controllers/newsletter';

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

export { router as newsletter }