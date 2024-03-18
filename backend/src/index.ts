import express from 'express';

import cookieSession from "cookie-session";
import { json } from "body-parser";
import cors from "cors";
import { errorHandler } from './middlewares/error-handler';
import dotenv from "dotenv";
import { auth } from "./routes/auth";
import { payments } from "./routes/payments";
import { blog } from "./routes/blog"
import path from 'path';
import { NeighborhoodRepository } from './database/repositories/neighborhoods';
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(__dirname, '..', dotenvPath);
dotenv.config({ path: envPath });

const neighborhoodRepo = new NeighborhoodRepository();
neighborhoodRepo.createIndexes();

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
app.use("/api/blog", blog);
app.use("/api/payments", payments);
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

