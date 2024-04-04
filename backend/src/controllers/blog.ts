import { Request, Response } from "express";
import { BlogRepository } from "../database/repositories/blog";
import { ObjectId } from 'mongodb';

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
 * @description user posts blog post
 * @route PUT /api/blog/post/:blogid
 * @access public
*/
export const updateBlog = async(req:Request, res: Response)=>{

  const { blogid } = req.params;
  const blogsRepository = new BlogRepository();
  const updateData = req.body;



  try {
    const blog = await blogsRepository.updateBlog(blogid, updateData);
    // Assuming you want to send back a success response
    res.json({ success: true, message: 'Blog updated successfully', blog });
  } catch (error) {
    // Handle error, for example, by sending a response with an error message
    res.status(400).json({ success: false });
  }

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
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const cursorParam = req.query.cursor;
  let cursor: ObjectId | undefined = undefined;
  if (typeof cursorParam === 'string' && cursorParam !== '') {
    try {
      cursor = new ObjectId(cursorParam);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid cursor format' });
    }
  }

  const blogsRepository = new BlogRepository();
  const allBlogs = await blogsRepository.getAllBlogs({ cursor, pageSize })//{ cursor, pageSize}
  res.status(200).send(allBlogs);
}

