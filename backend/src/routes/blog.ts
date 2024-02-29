import express, { NextFunction, Request, Response } from "express";

import { saveBlogPost, getBlog } from "../controllers/blog"

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  }
}

const router = express.Router();

router.post("/post", saveBlogPost)// controller to save blog data.
router.get("/post/:blogid", getBlog )


export {router as blog}