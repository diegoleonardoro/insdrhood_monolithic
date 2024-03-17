"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBlogs = exports.getBlog = exports.saveBlogPost = void 0;
const blog_1 = require("../database/repositories/blog");
/**
 * @description user posts blog post
 * @route POST /api/blog/post
 * @access public
*/
const saveBlogPost = async (req, res) => {
    const blogsRepository = new blog_1.BlogRepository();
    const newBlog = await blogsRepository.saveBlogPost(req.body);
    res.status(201).send(newBlog);
};
exports.saveBlogPost = saveBlogPost;
/**
 * @description gets a specific glov
 * @route GET /post/:blogid
 * @access public
*/
const getBlog = async (req, res) => {
    const { blogid } = req.params;
    const blogsRepository = new blog_1.BlogRepository();
    const blog = await blogsRepository.getBlog(blogid);
    res.status(200).send(blog);
};
exports.getBlog = getBlog;
/**
 * @description gets a specific glov
 * @route GET /api/blog/getblogs
 * @access public
*/
const getAllBlogs = async (req, res) => {
    const blogsRepository = new blog_1.BlogRepository();
    const allBlogs = await blogsRepository.getAllBlogs();
    res.status(200).send(allBlogs);
};
exports.getAllBlogs = getAllBlogs;
//# sourceMappingURL=blog.js.map