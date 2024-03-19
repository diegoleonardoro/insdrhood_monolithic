import { ObjectId, Db, InsertOneResult, Document } from 'mongodb';
import { connectToDatabase } from '../index';
import { BadRequestError } from '../../errors/bad-request-error';

export class BlogRepository {

  private db: Promise<Db>;
  private collectionName = 'blogs';

  constructor() {
    this.db = connectToDatabase();
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

  public async getAllBlogs(): Promise<any[]> {
    try {

      const db = await this.db;
      const blogsCollection = db.collection(this.collectionName);
      const projection = { title: 1, coverImageUrl: 1 };

      const explainOutput = await blogsCollection.find({}, { projection }).explain('executionStats');
      console.log('explainOutput all blogs', explainOutput);

      const blogs = await blogsCollection.find({}, { projection }).toArray();
      return blogs;

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



}