import express, { NextFunction, Request, Response } from "express";


import { saveBlogPost, getBlog, getAllBlogs, updateBlog } from "../controllers/blog"

function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  }
}

const router = express.Router();

router.post("/post", asyncHandler(saveBlogPost));// controller to save blog data.
router.get("/post/:blogid", asyncHandler(getBlog));
router.put("/post/:blogid", asyncHandler(updateBlog))
router.get("/getblogs", asyncHandler(getAllBlogs));



export { router as blog }