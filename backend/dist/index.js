"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const auth_1 = require("./routes/auth");
const mongodb_1 = require("mongodb");
// Determine the path based on NODE_ENV
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
// Set the DOTENV_CONFIG_PATH environment variable
process.env.DOTENV_CONFIG_PATH = dotenvPath;
// Dynamically import dotenv/config
Promise.resolve().then(() => __importStar(require('dotenv/config'))).catch(error => {
    console.error('Error loading the dotenv configuration:', error);
});
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
    credentials: true
}));
app.use((0, body_parser_1.json)());
app.set("trust proxy", true);
// mongoose.connect('mongodb+srv://diegoleoro:Sinnerman_0915@serverlessinstance0.8up76qk.mongodb.net/?retryWrites=true&w=majority');
app.use((0, cookie_session_1.default)({
    signed: false,
    // secure: process.env.NODE_ENV !== "test",
    secure: false,
}));
app.use("/api", auth_1.auth);
app.use(error_handler_1.errorHandler);
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Hi yaaaa! :)",
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map