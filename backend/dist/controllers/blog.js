"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBlogs = exports.getBlog = exports.updateBlog = exports.saveBlogPost = void 0;
const blog_1 = require("../database/repositories/blog");
const mongodb_1 = require("mongodb");
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
 * @description user posts blog post
 * @route PUT /api/blog/post/:blogid
 * @access public
*/
const updateBlog = async (req, res) => {
    const { blogid } = req.params;
    const blogsRepository = new blog_1.BlogRepository();
    const updateData = req.body;
    try {
        const blog = await blogsRepository.updateBlog(blogid, updateData);
        // Assuming you want to send back a success response
        res.json({ success: true, message: 'Blog updated successfully', blog });
    }
    catch (error) {
        // Handle error, for example, by sending a response with an error message
        res.status(400).json({ success: false });
    }
};
exports.updateBlog = updateBlog;
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
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const cursorParam = req.query.cursor;
    let cursor = undefined;
    if (typeof cursorParam === 'string' && cursorParam !== '') {
        try {
            cursor = new mongodb_1.ObjectId(cursorParam);
        }
        catch (error) {
            return res.status(400).json({ message: 'Invalid cursor format' });
        }
    }
    const blogsRepository = new blog_1.BlogRepository();
    const allBlogs = await blogsRepository.getAllBlogs({ cursor, pageSize }); //{ cursor, pageSize}
    res.status(200).send(allBlogs);
};
exports.getAllBlogs = getAllBlogs;
//# sourceMappingURL=blog.js.map