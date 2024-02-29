import express from 'express';

import cookieSession from "cookie-session";
import { json } from "body-parser";
import cors from "cors";
import { errorHandler } from './middlewares/error-handler';
import dotenv from "dotenv";
import { auth } from "./routes/auth";
import { payments } from "./routes/payments";
import {blog} from "./routes/blog" 
import { Db, MongoClient, ServerApiVersion, MongoError } from 'mongodb';
import path from 'path';

// import mongoose from 'mongoose';
// import { config } from 'dotenv';
// config();
// import routes:
// Determine the path based on NODE_ENV
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(__dirname, '..', dotenvPath);
dotenv.config({ path: envPath });


/** -------- -------- MongoDB Connection -------- -------- */
const uri = "mongodb+srv://diegoleoro:r85i3VAYY6k8UVDs@serverlessinstance0.8up76qk.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// let dbConnection: Db;

let dbConnection: Promise<Db>;

const connectToServer = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("insiderhood");
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

dbConnection = connectToServer();

export const getDb = () => dbConnection;

/** -------- -------- ---------- -------- -------- -------- */


const app = express();
const PORT = 4000;
app.use(cors({
  origin: process.env.BASE_URL?.split(" "), // React client's URL
  credentials: true,

}));

app.use(json());
app.set("trust proxy", true);

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: process.env.NODE_ENV === "production",
    // maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use("/api", auth);
app.use("/api/payments", payments);
app.use("/api/blog", blog)

app.use(errorHandler);

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Holaaaa youuuu! :)",
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

