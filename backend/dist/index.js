"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = void 0;
const express_1 = __importDefault(require("express"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const error_handler_1 = require("./middlewares/error-handler");
// import { config } from 'dotenv';
// config();
// import routes:
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const mongodb_1 = require("mongodb");
const path_1 = __importDefault(require("path"));
// Determine the path based on NODE_ENV
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path_1.default.resolve(__dirname, '..', dotenvPath);
dotenv_1.default.config({ path: envPath });
/** -------- -------- MongoDB Connection -------- -------- */
const uri = "mongodb+srv://diegoleoro:r85i3VAYY6k8UVDs@serverlessinstance0.8up76qk.mongodb.net/?retryWrites=true&w=majority";
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let dbConnection;
const connectToServer = async () => {
    try {
        await client.connect();
        dbConnection = client.db("insiderhood");
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error(error);
    }
};
connectToServer();
const getDb = () => dbConnection;
exports.getDb = getDb;
/** -------- -------- ---------- -------- -------- -------- */
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)({
    origin: process.env.BASE_URL,
    credentials: true,
}));
app.use((0, body_parser_1.json)());
app.set("trust proxy", true);
app.use((0, cookie_session_1.default)({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    httpOnly: process.env.NODE_ENV === "production",
    // maxAge: 24 * 60 * 60 * 1000,
}));
app.use("/api", auth_1.auth);
app.use(error_handler_1.errorHandler);
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Holaaaa youuuu! :)",
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map