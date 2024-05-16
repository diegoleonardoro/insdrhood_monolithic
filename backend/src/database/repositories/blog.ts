import { ObjectId, Db, InsertOneResult, Document } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';
import { createClient, RedisClientType } from 'redis';

export class BlogRepository {

  private db: Promise<Db>;
  private collectionName = 'blogs';
  private redisClient: RedisClientType;

  constructor() {
    this.db = connectToDatabase();
    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });
    this.redisClient.connect().catch(console.error);
  }

  public async createIndexes(): Promise<void> {
    try {
      const db = await this.db;
      const blogsCollection = db.collection(this.collectionName);

      // Create an index on the title field if you query by title
      await blogsCollection.createIndex({ title: 1 });

      // Create an index on the coverImageUrl field if you query by coverImageUrl
      await blogsCollection.createIndex({ coverImageUrl: 1 });

      console.log('Indexes ensured for blogs collection');
    } catch (error) {
      console.error('Error ensuring indexes', error);
      throw new BadRequestError('Failed to ensure indexes for blogs');
    }
  }

  public async getAllBlogs({ cursor, pageSize }: { cursor?: ObjectId | undefined, pageSize: number }): Promise<{ blogs: any[], nextCursor?: string }> {
    
    const cacheKey = 'blogs';

    try {

      const cachedBlogs = await this.redisClient.get(cacheKey);
      if (cachedBlogs) {

        console.log("cached blogs", JSON.parse(cachedBlogs))
        return JSON.parse(cachedBlogs);
      }

      const db = await this.db;
      const blogsCollection = db.collection(this.collectionName);
      const projection = { title: 1, coverImageUrl: 1 };

      let query = {};
      if (cursor) {
        query = { '_id': { '$gt': new ObjectId(cursor) } };
      }
      const blogsCursor = blogsCollection.find(query)
        .project(projection)
        .limit(pageSize)
        .sort({ '_id': 1 });

      const blogs = await blogsCursor.toArray();
      let nextCursor = null;
      if (blogs.length > 0) {
        nextCursor = blogs[blogs.length - 1]._id.toString();
      }

      const result = { blogs, nextCursor };
      // Cache the result in Redis
      await this.redisClient.setEx(cacheKey, 86400, JSON.stringify(result));  // Expiry time is set to 3600 seconds (1 hour)

      return result;

    } catch (error) {
      // Assuming you have some error handling mechanism
      throw new BadRequestError('Failed to fetch blogs');
    }
  }


  public async getBlog(blogId: string): Promise<any> {
    try {
      const db = await this.db;
      const blogsCollection = db.collection(this.collectionName);
      const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
      if (!blog) {
        throw new BadRequestError('Blog not found');
      }
      return blog; // Return the found blog
    } catch (error) {
      // Error handling specific to fetching a single blog
      throw error;
    }
  }

  public async saveBlogPost(blogData: {}): Promise<InsertOneResult<Document>> {
    try {
      const db = await this.db;
      const blogsCollection = db.collection(this.collectionName);
      const newBlog = await blogsCollection.insertOne(blogData);
      return newBlog; // Return the result of the insertion
    } catch (error) {
      // Error handling for blog post saving operation
      throw new BadRequestError('Failed to save the blog post');
    }
  }


  public async updateBlog(blogId: string, updateData: {}): Promise<Document> {
    try {
      const db = await this.db;
      const blogsCollection = db.collection(this.collectionName);

      // The $set operator replaces the value of a field with the specified value
      const updateResult = await blogsCollection.updateOne(
        { _id: new ObjectId(blogId) }, // Filter document by _id
        { $set: updateData } // Update document specifying the fields to update
      );

      if (updateResult.matchedCount === 0) {
        throw new BadRequestError('Blog not found');
      }

      return updateResult; // Return the result of the update operation
    } catch (error) {
      console.error('Failed to update the blog post', error);
      throw new BadRequestError('Failed to update the blog post');
    }
  }




}