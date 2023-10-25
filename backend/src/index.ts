import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieSession from "cookie-session";
import { json } from "body-parser";
import cors from "cors";
import { errorHandler } from './mddlewares/error-handler';

// import routes:
import { auth } from "./routes/auth";


const app = express();
const PORT = 4000;
app.use(cors());
app.use(json());
app.set("trust proxy", true);
mongoose.connect('mongodb://127.0.0.1:27017/insider_hood');
app.use(express.static(path.join(__dirname, '../../client/public')));

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== "test",
    secure: false,
  })
);


app.use("/api", auth);
app.use(errorHandler);

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// app.get('/api', (req, res) => {
//   res.send('Hello from the TypeScript backend!');
// });ll

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

