import express from 'express';
// import path from 'path';
import mongoose from 'mongoose';
import cookieSession from "cookie-session";
import { json } from "body-parser";
import cors from "cors";
import { errorHandler } from './middlewares/error-handler';
// import { config } from 'dotenv';
// config();
// import routes:
import dotenv from "dotenv";
import { auth } from "./routes/auth";
import { Db, MongoClient, ServerApiVersion, MongoError } from 'mongodb';
import path from 'path';


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

let dbConnection: Db;
const connectToServer = async () => {
  try {
    await client.connect();
    dbConnection = client.db("insiderhood")
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error(error)
  }
}
connectToServer();
export const getDb = (): Db => dbConnection;
/** -------- -------- ---------- -------- -------- -------- */


const app = express();
const PORT = 4000;
app.use(cors({
  origin: process.env.BASE_URL, // React client's URL
  credentials: true,

}));

app.use(json());
app.set("trust proxy", true);
// mongoose.connect('mongodb+srv://diegoleoro:Sinnerman_0915@serverlessinstance0.8up76qk.mongodb.net/?retryWrites=true&w=majority');


//---------------------------------------------------------------------------------

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
console.log("process.env.BASE_URL", process.env.BASE_URL);
console.log("process.env.NODE_ENV === production", process.env.NODE_ENV === "production");

app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Path: ${req.path}`);
  next();
});

app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  next();
});

//---------------------------------------------------------------------------------
app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== "test",
    secure: process.env.NODE_ENV === "production",
    sameSite: false, // Set sameSite to false
    // secure: false
  })
);
//---------------------------------------------------------------------------------
app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  next();
});
//---------------------------------------------------------------------------------



app.use("/api", auth);
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

