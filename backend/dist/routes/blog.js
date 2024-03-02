"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blog = void 0;
const express_1 = __importDefault(require("express"));
const blog_1 = require("../controllers/blog");
function asyncHandler(fn) {
    return function (req, res, next) {
        return Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}
const router = express_1.default.Router();
exports.blog = router;
router.post("/post", blog_1.saveBlogPost); // controller to save blog data.
router.get("/post/:blogid", blog_1.getBlog);
router.get("/getblogs", blog_1.getAllBlogs);
//# sourceMappingURL=blog.js.map