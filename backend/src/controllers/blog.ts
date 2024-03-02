import { Request, Response } from "express";
import { getDb } from "../index";
import { ObjectId } from 'mongodb';

/**
 * @description user posts blog post
 * @route POST /api/blog/post 
 * @access public
*/
export const saveBlogPost = async (req: Request, res: Response) => {
  const { blogBody } = req.body;
  const db = await getDb();
  const blogs = db.collection("blogs");
  const newBlog = await blogs.insertOne(blogBody);
  res.status(201).send(newBlog);
}


/**
 * @description gets a specific glov 
 * @route GET /post/:blogid
 * @access public
*/
export const getBlog = async (req: Request, res: Response) => {

  const { blogid } = req.params;
  const db = await getDb();
  const blogs = db.collection("blogs");
  const blog = await blogs.findOne({ _id: new ObjectId(blogid) });
  res.status(200).send(blog);

}


/**
 * @description gets a specific glov 
 * @route GET /api/blog/getblogs
 * @access public
*/

export const getAllBlogs = async (req: Request, res: Response) => {

  const db = await getDb();
  const blogsCollection = db.collection("blogs");
  const blogs = await blogsCollection.find({}).toArray();
  res.status(200).send(blogs);

}