"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlog = exports.saveBlogPost = void 0;
const index_1 = require("../index");
const mongodb_1 = require("mongodb");
/**
 * @description user posts blog post
 * @route POST /api/blog/post
 * @access public
*/
const saveBlogPost = async (req, res) => {
    const { blogBody } = req.body;
    const db = await (0, index_1.getDb)();
    const blogs = db.collection("blogs");
    const newBlog = await blogs.insertOne(blogBody);
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
//# sourceMappingURL=blog.js.map