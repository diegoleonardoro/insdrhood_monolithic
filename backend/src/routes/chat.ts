import express, { NextFunction, Request, Response } from "express";
import { authenticationValidator } from "../middlewares/authentication-validator";
import { SendChatNotifications, SendChatHistory } from "../controllers/chat"

const router = express.Router();

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  }
}

// base route: /api/chat
router.post("/sendChatInfo",  asyncHandler(SendChatNotifications));
router.post("/chatSummary",  SendChatHistory);

export { router as chat }