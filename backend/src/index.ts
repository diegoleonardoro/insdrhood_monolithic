import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieSession from "cookie-session";
import { json } from "body-parser";
import cors from "cors";

// import routes:
import {auth} from "./routes/auth";


const app = express();
const PORT = 4000;

app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/myapp');

app.use(express.static(path.join(__dirname, '../../client/public')));

app.set("trust proxy", true);
app.use(json());

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== "test",
    secure: false,
  })
);

app.use("/api", auth);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// app.get('/api', (req, res) => {
//   res.send('Hello from the TypeScript backend!');
// });


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

