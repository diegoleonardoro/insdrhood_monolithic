import { Request, Response } from "express";
import { BlogRepository } from "../database/repositories/blog";


/**
 * @description user posts blog post
 * @route POST /api/blog/post 
 * @access public
*/
export const saveBlogPost = async (req: Request, res: Response) => {
  const blogsRepository = new BlogRepository();
  const newBlog = await blogsRepository.saveBlogPost(req.body)
  res.status(201).send(newBlog);
}

/**
 * @description gets a specific glov 
 * @route GET /post/:blogid
 * @access public
*/
export const getBlog = async (req: Request, res: Response) => {
  const { blogid } = req.params;
  const blogsRepository = new BlogRepository();
  const blog = await blogsRepository.getBlog(blogid);
  res.status(200).send(blog);
}


/**
 * @description gets a specific glov 
 * @route GET /api/blog/getblogs
 * @access public
*/

export const getAllBlogs = async (req: Request, res: Response) => {
  const blogsRepository = new BlogRepository();
  const allBlogs = await blogsRepository.getAllBlogs()
  res.status(200).send(allBlogs);
}

