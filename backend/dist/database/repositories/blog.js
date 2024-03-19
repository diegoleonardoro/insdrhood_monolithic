"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogRepository = void 0;
const mongodb_1 = require("mongodb");
const index_1 = require("../index");
const bad_request_error_1 = require("../../errors/bad-request-error");
class BlogRepository {
    constructor() {
        this.collectionName = 'blogs';
        this.db = (0, index_1.connectToDatabase)();
    }
    async createIndexes() {
        try {
            const db = await this.db;
            const blogsCollection = db.collection(this.collectionName);
            // Create an index on the title field if you query by title
            await blogsCollection.createIndex({ title: 1 });
            // Create an index on the coverImageUrl field if you query by coverImageUrl
            await blogsCollection.createIndex({ coverImageUrl: 1 });
            console.log('Indexes ensured for blogs collection');
        }
        catch (error) {
            console.error('Error ensuring indexes', error);
            throw new bad_request_error_1.BadRequestError('Failed to ensure indexes for blogs');
        }
    }
    async getAllBlogs() {
        try {
            const db = await this.db;
            const blogsCollection = db.collection(this.collectionName);
            const projection = { title: 1, coverImageUrl: 1 };
            // const explainOutput = await blogsCollection.find({}, { projection }).explain('executionStats');
            // console.log(explainOutput);
            const blogs = await blogsCollection.find({}, { projection }).toArray();
            return blogs;
        }
        catch (error) {
            // Assuming you have some error handling mechanism
            throw new bad_request_error_1.BadRequestError('Failed to fetch blogs');
        }
    }
    async getBlog(blogId) {
        try {
            const db = await this.db;
            const blogsCollection = db.collection(this.collectionName);
            const blog = await blogsCollection.findOne({ _id: new mongodb_1.ObjectId(blogId) });
            if (!blog) {
                throw new bad_request_error_1.BadRequestError('Blog not found');
            }
            return blog; // Return the found blog
        }
        catch (error) {
            // Error handling specific to fetching a single blog
            throw error;
        }
    }
    async saveBlogPost(blogData) {
        try {
            const db = await this.db;
            const blogsCollection = db.collection(this.collectionName);
            const newBlog = await blogsCollection.insertOne(blogData);
            return newBlog; // Return the result of the insertion
        }
        catch (error) {
            // Error handling for blog post saving operation
            throw new bad_request_error_1.BadRequestError('Failed to save the blog post');
        }
    }
}
exports.BlogRepository = BlogRepository;
//# sourceMappingURL=blog.js.map