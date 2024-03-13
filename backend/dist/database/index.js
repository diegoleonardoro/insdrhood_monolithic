"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const mongodb_1 = require("mongodb");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Determine the path based on NODE_ENV
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path_1.default.resolve(process.cwd(), dotenvPath);
dotenv_1.default.config({ path: envPath });
const uri = process.env.MONGODB_URI;
const client = new mongodb_1.MongoClient(uri ? uri : '', {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let dbConnection;
const connectToDatabase = async () => {
    if (!dbConnection) {
        dbConnection = client.connect().then(client => {
            return client.db("insiderhood");
        });
    }
    return dbConnection;
};
exports.connectToDatabase = connectToDatabase;
//# sourceMappingURL=index.js.map