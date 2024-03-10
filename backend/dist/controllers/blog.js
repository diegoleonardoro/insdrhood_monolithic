"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBlogs = exports.getBlog = exports.saveBlogPost = void 0;
const index_1 = require("../index");
const mongodb_1 = require("mongodb");
/**
 * @description user posts blog post
 * @route POST /api/blog/post
 * @access public
*/
const saveBlogPost = async (req, res) => {
    const db = await (0, index_1.getDb)();
    const blogs = db.collection("blogs");
    const newBlog = await blogs.insertOne(req.body);
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
    const db = await (0, index_1.getDb)();
    const blogs = db.collection("blogs");
    const blog = await blogs.findOne({ _id: new mongodb_1.ObjectId(blogid) });
    res.status(200).send(blog);
};
exports.getBlog = getBlog;
/**
 * @description gets a specific glov
 * @route GET /api/blog/getblogs
 * @access public
*/
const getAllBlogs = async (req, res) => {
    const db = await (0, index_1.getDb)();
    const blogsCollection = db.collection("blogs");
    const projection = { title: 1, coverImageUrl: 1 };
    const blogs = await blogsCollection.find({}, { projection: projection }).toArray();
    res.status(200).send(blogs);
};
exports.getAllBlogs = getAllBlogs;
//# sourceMappingURL=blog.js.map