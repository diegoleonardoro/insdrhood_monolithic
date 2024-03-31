"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const error_handler_1 = require("./middlewares/error-handler");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const payments_1 = require("./routes/payments");
const blog_1 = require("./routes/blog");
const path_1 = __importDefault(require("path"));
const neighborhoods_1 = require("./database/repositories/neighborhoods");
const blog_2 = require("./database/repositories/blog");
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path_1.default.resolve(__dirname, '..', dotenvPath);
dotenv_1.default.config({ path: envPath });
const neighborhoodRepo = new neighborhoods_1.NeighborhoodRepository();
neighborhoodRepo.createIndexes();
const blogRepo = new blog_2.BlogRepository();
blogRepo.createIndexes();
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)({
    origin: process.env.BASE_URL?.split(" "),
    credentials: true,
}));
app.use((0, body_parser_1.json)({
    verify: (req, res, buffer, encoding) => {
        // Store the raw body buffer
        if (buffer && buffer.length) {
            req.rawBody = buffer;
        }
    }
}));
app.set("trust proxy", true);
app.use((0, cookie_session_1.default)({
    signed: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: process.env.NODE_ENV === "production",
    // maxAge: 24 * 60 * 60 * 1000,
}));
app.use("/api/blog", blog_1.blog);
app.use("/api/payments", payments_1.payments);
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