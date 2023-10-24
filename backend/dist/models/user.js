"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const password_1 = require("../services/password");
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    isVerified: {
        type: Boolean,
        required: false,
    },
    emailToken: {
        type: String,
        required: false,
    },
    formsResponded: {
        type: Number,
        required: true
    },
    residentId: {
        type: String,
        required: false
    },
    passwordSet: {
        type: Boolean,
        required: true
    },
    userImagesId: {
        type: String,
        required: false
    }
}, {
    toJSON: {
        transform(doc, ret) {
            //ret is the option we need to modify if we want to change how the user object is returned:
            ret.id = ret._id;
            delete ret._id;
            // if we do not want the password from any user that is returned
            delete ret.password;
            delete ret.__v;
        },
    },
});
// pre ('save') is a middleware function implemented by mongoose, executed before saving a user to the database. 'done' needs to be called in every async function used with mongoose.
userSchema.pre("save", async function (done) {
    if (this.isModified("password")) {
        const password = this.get("password");
        if (typeof password === "string") {
            const hashed = await password_1.Password.toHash(password);
            this.set("password", hashed);
        }
    }
    done();
});
userSchema.statics.build = (attrs) => {
    return new User(attrs);
};
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
