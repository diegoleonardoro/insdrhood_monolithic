"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const error_handler_1 = require("./middlewares/error-handler");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// import routes:
const auth_1 = require("./routes/auth");
const envPath = path_1.default.join(__dirname);
(0, dotenv_1.config)({ path: envPath });
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use((0, body_parser_1.json)());
app.set("trust proxy", true);
mongoose_1.default.connect('mongodb://127.0.0.1:27017/insider_hood');
app.use((0, cookie_session_1.default)({
    signed: false,
    // secure: process.env.NODE_ENV !== "test",
    secure: false,
}));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/public')));
app.use("/api", auth_1.auth);
app.use(error_handler_1.errorHandler);
// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/public/index.html'));
});
// app.get('/api', (req, res) => {
//   res.send('Hello from the TypeScript backend!');
// });ll
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
