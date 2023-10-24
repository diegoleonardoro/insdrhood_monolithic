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
// import routes:
const auth_1 = require("./routes/auth");
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)());
mongoose_1.default.connect('mongodb://127.0.0.1:27017/myapp');
app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/public')));
app.set("trust proxy", true);
app.use((0, body_parser_1.json)());
app.use((0, cookie_session_1.default)({
    signed: false,
    // secure: process.env.NODE_ENV !== "test",
    secure: false,
}));
app.use("/api", auth_1.auth);
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/index.html'));
});
// app.get('/api', (req, res) => {
//   res.send('Hello from the TypeScript backend!');
// });
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
