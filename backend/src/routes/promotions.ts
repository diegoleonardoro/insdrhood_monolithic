import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { authenticationValidator } from "../middlewares/authentication-validator";

import { insertsPromotionsToDb }from"../controllers/promotions";

const router = express.Router();

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  }
}

// base route: /api/promotions
router.post("/addPromotions", authenticationValidator, asyncHandler(insertsPromotionsToDb));



export { router as promotions }